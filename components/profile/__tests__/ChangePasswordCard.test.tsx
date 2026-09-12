import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// The property under test is a matter of TIMING, so this file controls when translations become
// available relative to when the module-scope schema is built. `loadedTranslations` starts null to
// stand in for the window before i18next has fetched anything (see the note on `validationMessageLazy`
// in utils/lang.ts); the component is imported while it is still null, and only then filled —
// exactly the order a real page hits.
let loadedTranslations: Record<string, string> | null = null;

const mockT = vi.fn((key: string, options?: Record<string, unknown>) => {
  if (!loadedTranslations) return undefined;
  const template = loadedTranslations[key];
  if (template === undefined) return key;
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(options?.[name] ?? ''));
});

vi.mock('@/config/i18next', () => ({ default: { t: mockT } }));

const SPANISH: Record<string, string> = {
  'validation:attributes.currentPassword': 'contraseña actual',
  'validation:attributes.password': 'contraseña',
  'validation:attributes.passwordConfirmation': 'confirmación de contraseña',
  'validation:required': 'El campo {{attribute}} es obligatorio.',
  'validation:min.string': 'El campo {{attribute}} debe tener al menos {{min}} caracteres.',
  'validation:password.letters': 'El campo {{attribute}} debe contener al menos una letra.',
  'validation:password.mixed':
    'El campo {{attribute}} debe contener al menos una mayúscula y una minúscula.',
  'validation:password.numbers': 'El campo {{attribute}} debe contener al menos un número.',
  'validation:password.symbols': 'El campo {{attribute}} debe contener al menos un símbolo.',
  'validation:confirmed': 'La confirmación del campo {{attribute}} no coincide.',
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, ready: true }),
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('@/utils/form', () => ({ applyApiErrorsToForm: vi.fn() }));

const mutate = vi.fn();
vi.mock('@/hooks/auth', () => ({
  useUpdatePasswordMutation: () => ({ mutate, isPending: false }),
}));

// Imported dynamically, and deliberately NOT at the top of the file: a static import would run
// the module body before the test body, taking the timing this file exists to control out of
// its hands. `loadedTranslations` is still null here, so the schema is built in the pre-init window.
const { ChangePasswordCard } = await import('../ChangePasswordCard');

// Pins the premise directly, so that hoisting the import back to the top of the file fails here
// rather than silently voiding every assertion below.
expect(mockT).not.toHaveBeenCalled();

// Fragments of zod's own built-in English, which is what the user sees whenever a message
// resolves to `undefined`. Kept broad on purpose: the assertion is that NONE of zod's wording
// reaches the DOM, whatever phrasing this version of zod uses.
const ZOD_ENGLISH_PATTERN = /Too small|Invalid|expected|characters$|must contain|match pattern/i;

async function submitForm() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'auth:update_password.button' }));
}

describe('ChangePasswordCard validation messages', () => {
  beforeEach(() => {
    loadedTranslations = null;
  });

  it('renders the translated message for every field, though the schema was built before i18n was ready', async () => {
    loadedTranslations = SPANISH;
    render(<ChangePasswordCard />);

    await submitForm();

    await waitFor(() => {
      expect(screen.getByText('El campo contraseña actual es obligatorio.')).toBeInTheDocument();
    });
    expect(
      screen.getByText('El campo contraseña debe tener al menos 8 caracteres.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('El campo confirmación de contraseña es obligatorio.')
    ).toBeInTheDocument();
  });

  it('never falls back to a zod English default', async () => {
    loadedTranslations = SPANISH;
    const { container } = render(<ChangePasswordCard />);

    await submitForm();

    await waitFor(() => {
      expect(container.querySelectorAll('[data-slot="form-message"]').length).toBeGreaterThan(0);
    });

    const messages = Array.from(container.querySelectorAll('[data-slot="form-message"]')).map(
      (el) => el.textContent ?? ''
    );
    for (const message of messages) {
      expect(message).not.toMatch(ZOD_ENGLISH_PATTERN);
    }
  });

  it('follows a language switch that happens after the schema was built', async () => {
    loadedTranslations = SPANISH;
    render(<ChangePasswordCard />);

    await submitForm();
    await waitFor(() => {
      expect(screen.getByText('El campo contraseña actual es obligatorio.')).toBeInTheDocument();
    });

    // The switch itself — the same module-scope schema object, a different language. An eagerly
    // resolved message would still be showing the Spanish it captured the first time round.
    loadedTranslations = {
      ...SPANISH,
      'validation:attributes.currentPassword': 'mot de passe actuel',
      'validation:required': 'Le champ {{attribute}} est obligatoire.',
    };

    await submitForm();
    await waitFor(() => {
      expect(screen.getByText('Le champ mot de passe actuel est obligatoire.')).toBeInTheDocument();
    });
  });

  it('reports the complexity rules in the user language, not zod regex wording', async () => {
    loadedTranslations = SPANISH;
    render(<ChangePasswordCard />);

    await userEvent
      .setup()
      .type(screen.getByLabelText('auth:update_password.new_password'), 'abcdefghi');
    await submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(
          'El campo contraseña debe contener al menos una mayúscula y una minúscula.'
        )
      ).toBeInTheDocument();
    });
  });
});
