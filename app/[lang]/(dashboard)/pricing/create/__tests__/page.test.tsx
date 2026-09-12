import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import CreatePricingRulePage from '../page';

// Every numeric field here is a controlled `<input type="number">`, and React
// re-asserts the controlled value onto the DOM after *every* change event via
// `restoreStateOfTarget` — not only on re-render. `updateInput` then carries a
// special case for this element type:
//
//   if ((0 === value && "" === element.value) || element.value != value)
//     element.value = "" + getToStringValue(value);
//
// So a handler that turns an emptied box into the *number* 0 makes the field
// unclearable: the 0 is written straight back every time. The sentinel for an
// empty box has to be `null`, not `undefined` — react-hook-form reads a field
// through `get(values, name, defaultValue)`, which hands back the defaultValue
// whenever the stored value is `undefined`, so `undefined` resolves to 0 again
// and re-arms the lock.
//
// Two things below are deliberately shaped around jsdom's limits:
//
//  * Submission goes through `fireEvent.submit` rather than clicking Save.
//    jsdom computes `stepMismatch` with naive float math, and the multipliers
//    carry min="0.01" step="0.01" with defaults like 1.5 — (1.5 - 0.01) / 0.01
//    is 149.00000000000003, so jsdom marks the form invalid and never fires
//    submit. Real browsers are tolerant here.
//  * There is no test for a half-typed "2." reading back as "", which is the
//    sibling defect that made a typed fee arrive as a string. jsdom does not
//    implement number-input value sanitization and returns "2." verbatim, so
//    it cannot be reproduced under test.

const push = vi.fn();
const back = vi.fn();

vi.mock('@/hooks/useLocalizedRouter', () => ({
  useLocalizedRouter: () => ({ push, back, lang: 'en' }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, ready: true }),
}));

vi.mock('@/utils/lang', () => ({
  actionLabel: (key: string) => key,
  validationAttribute: (key: string) => key,
  // The module-scope schema calls this at import and hands the thunk to zod,
  // so the stub has to return a function rather than a string.
  validationMessageLazy: (key: string) => () => key,
}));

const mutateAsync = vi.fn();
vi.mock('@/hooks/pricing', () => ({
  useCreatePricingRule: () => ({ mutateAsync, isPending: false }),
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
      <CreatePricingRulePage />
    </QueryClientProvider>
  );
}

function submitForm() {
  fireEvent.submit(document.querySelector('form')!);
}

beforeEach(() => {
  push.mockClear();
  back.mockClear();
  mutateAsync.mockReset();
});

describe('CreatePricingRulePage — numeric fields reach the API as numbers', () => {
  it('sends a typed service fee as a number, not as the input string', async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValue({});
    renderPage();

    await user.type(screen.getByLabelText('name'), 'Standard Pricing');

    const serviceFee = screen.getByLabelText('serviceFee');
    await user.clear(serviceFee);
    await user.type(serviceFee, '25');

    submitForm();

    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    const payload = mutateAsync.mock.calls[0][0];

    expect(payload.serviceFee).toBe(25);
    expect(typeof payload.serviceFee).toBe('number');
  });

  it('sends a retyped tier multiplier as a number', async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValue({});
    renderPage();

    await user.type(screen.getByLabelText('name'), 'Standard Pricing');

    const expedited = screen.getByLabelText('expedited_multiplier');
    await user.clear(expedited);
    await user.type(expedited, '2');

    submitForm();

    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    const payload = mutateAsync.mock.calls[0][0];

    expect(payload.expeditedMultiplier).toBe(2);
    expect(typeof payload.regularMultiplier).toBe('number');
  });
});

describe('CreatePricingRulePage — a zero-valued field stays clearable', () => {
  it('does not write the 0 back into the service fee when the box is emptied', async () => {
    const user = userEvent.setup();
    renderPage();

    const serviceFee = screen.getByLabelText('serviceFee') as HTMLInputElement;
    expect(serviceFee.value).toBe('0');

    await user.clear(serviceFee);

    expect(serviceFee.value).toBe('');
  });

  it('does not write the 0 back into the tax rate when the box is emptied', async () => {
    const user = userEvent.setup();
    renderPage();

    const taxRate = screen.getByLabelText('taxRate (%)') as HTMLInputElement;
    expect(taxRate.value).toBe('0');

    await user.clear(taxRate);

    expect(taxRate.value).toBe('');
  });

  it('shows a fractional tax rate back without floating-point noise', async () => {
    const user = userEvent.setup();
    renderPage();

    const taxRate = screen.getByLabelText('taxRate (%)') as HTMLInputElement;
    await user.clear(taxRate);
    await user.type(taxRate, '7.25');

    // The field stores a fraction and renders it back as a percentage, and
    // 7.25 / 100 * 100 is 7.249999999999999 in IEEE 754. The admin who just
    // typed 7.25 must not be shown that.
    expect(taxRate.value).toBe('7.25');
  });
});
