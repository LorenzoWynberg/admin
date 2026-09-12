import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import CreateStaffPage from '../page';
import { CatalogService } from '@/services/catalogService';
import { applyApiErrorsToForm } from '@/utils/form';

// The Radix Select under the role/sex/language fields relies on pointer
// capture APIs the test DOM doesn't implement — without these the popover
// silently never opens under test, though it works fine in a real browser.
// Mirrors components/balance/__tests__/BalanceCard.test.tsx.
beforeAll(() => {
  window.HTMLElement.prototype.hasPointerCapture = () => false;
  window.HTMLElement.prototype.releasePointerCapture = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
});

const push = vi.fn();

// This page's own router comes through next/navigation — override the
// blanket vitest.setup.ts stub so `params.lang` resolves and `push` is a
// single stable spy we can assert against.
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({ lang: 'en' }),
  usePathname: () => '/en/staff/create',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, ready: true }),
}));

vi.mock('@/utils/lang', () => ({
  actionLabel: (key: string) => key,
  validationAttribute: (key: string) => key,
  // The page's module-scope schema calls this at import and hands the thunk to zod,
  // so the stub has to return a function rather than a string.
  validationMessageLazy: (key: string) => () => key,
}));

const mutateAsync = vi.fn();
vi.mock('@/hooks/staff', () => ({
  useCreateStaff: () => ({ mutateAsync, isPending: false }),
}));

vi.mock('@/services/catalogService', () => ({
  CatalogService: { getElementsByCode: vi.fn() },
}));

vi.mock('@/services/uploadService', () => ({
  UploadService: { upload: vi.fn() },
}));

vi.mock('@/utils/form', () => ({
  applyApiErrorsToForm: vi.fn(),
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CreateStaffPage />
    </QueryClientProvider>
  );
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('name'), 'Jordan Lee');
  await user.type(screen.getByLabelText('email'), 'jordan@example.com');
  await user.type(screen.getByLabelText('phone'), '+506 8888-8888');
  fireEvent.change(screen.getByLabelText('dateOfBirth'), { target: { value: '1990-01-01' } });

  await user.click(screen.getByRole('combobox', { name: 'sex' }));
  await user.click(await screen.findByRole('option', { name: 'Other' }));

  await user.click(screen.getByRole('combobox', { name: 'langCode' }));
  await user.click(await screen.findByRole('option', { name: 'English' }));
}

beforeEach(() => {
  push.mockClear();
  mutateAsync.mockReset();
  vi.mocked(applyApiErrorsToForm).mockClear();
  vi.mocked(CatalogService.getElementsByCode).mockImplementation((code: string) => {
    if (code === 'sex') {
      return Promise.resolve({
        items: [{ id: 1, name: 'Other' }],
      } as unknown as Api.Response.Paginated<App.Data.CatalogElement.CatalogElementData>);
    }
    return Promise.resolve({
      items: [{ code: 'en', name: 'English' }],
    } as unknown as Api.Response.Paginated<App.Data.CatalogElement.CatalogElementData>);
  });
});

describe('CreateStaffPage — role select', () => {
  it('offers exactly the two staff roles, sourced from the generated Role enum', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('combobox', { name: 'role' }));
    const listbox = await screen.findByRole('listbox');
    const options = within(listbox).getAllByRole('option');

    expect(options.map((o) => o.textContent)).toEqual(['users:role.dispatch', 'users:role.admin']);
  });
});

describe('CreateStaffPage — submit', () => {
  it('never sends a password field, and routes to /users on success', async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValue({});
    renderPage();

    await fillRequiredFields(user);

    await user.click(screen.getByRole('combobox', { name: 'role' }));
    await user.click(await screen.findByRole('option', { name: 'users:role.admin' }));

    await user.click(screen.getByRole('button', { name: 'save' }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    const payload = mutateAsync.mock.calls[0][0];

    expect(payload).not.toHaveProperty('password');
    expect(payload).toMatchObject({
      name: 'Jordan Lee',
      email: 'jordan@example.com',
      phone: '+506 8888-8888',
      dateOfBirth: '1990-01-01',
      sexId: 1,
      langCode: 'en',
      role: 'admin',
    });

    await waitFor(() => expect(push).toHaveBeenCalledWith('/en/users'));
  });

  it('maps API validation errors onto fields via applyApiErrorsToForm, role included', async () => {
    const user = userEvent.setup();
    const apiError = new Error('Validation failed');
    mutateAsync.mockRejectedValue(apiError);
    renderPage();

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: 'save' }));

    await waitFor(() => expect(applyApiErrorsToForm).toHaveBeenCalled());
    const [errArg, , fieldMap] = vi.mocked(applyApiErrorsToForm).mock.calls[0];

    expect(errArg).toBe(apiError);
    expect(fieldMap).toMatchObject({
      name: 'name',
      email: 'email',
      phone: 'phone',
      dateOfBirth: 'dateOfBirth',
      sexId: 'sexId',
      langCode: 'langCode',
      role: 'role',
      avatar: 'avatar',
    });
    expect(push).not.toHaveBeenCalled();
  });
});
