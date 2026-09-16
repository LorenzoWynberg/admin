import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CurrencySettingsPage from '../page';

// The rounding-increment field held its value as a *number* and parsed the
// typed string on every keystroke — `parseFloat(e.target.value) || 0.01`.
// React re-asserts a controlled `<input type="number">`'s value onto the DOM
// after every change event (`restoreStateOfTarget` -> `updateInput`), so
// clearing the box produced `parseFloat('') || 0.01` -> `0.01`, and that 0.01
// was written straight back into the DOM before the next keystroke landed —
// the box could never be emptied. The fix holds the typed string as-is and
// only parses it at save time (handleSaveRounding).

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? key,
    ready: true,
  }),
}));

vi.mock('@/utils/lang', () => ({
  actionLabel: (key: string) => key,
  capitalize: (s: string) => s,
  resourceMessage: (key: string) => key,
  statusLabel: (key: string) => key,
  validationAttribute: (key: string) => key,
}));

const currency: App.Data.Currency.CurrencyData = {
  code: 'USD',
  symbol: '$',
  name: 'US Dollar',
  precision: 2,
  isEnabled: true,
  isBase: false,
  roundingMode: 'nearest',
  roundingIncrement: 0.01,
  currentRate: 1.2,
  rateDate: '2026-09-01',
  rateSource: 'manual-provider',
};

vi.mock('@/hooks/currencies', () => ({
  useCurrencyList: () => ({ data: { items: [currency] }, isLoading: false, error: null }),
  useUpdateCurrency: () => ({ mutate: mutateUpdate, isPending: false }),
}));

vi.mock('@/hooks/exchange-rates', () => ({
  useSyncExchangeRates: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/settings/useExchangeRateMode', () => ({
  useExchangeRateMode: () => ({ data: { exchangeRateMode: 'auto' } }),
  useUpdateExchangeRateMode: () => ({ mutate: vi.fn(), isPending: false }),
}));

const mutateUpdate = vi.fn();

async function openEditDialog() {
  const user = userEvent.setup();
  render(<CurrencySettingsPage />);
  await user.click(screen.getByRole('button', { name: 'edit' }));
  return user;
}

beforeEach(() => {
  mutateUpdate.mockClear();
});

describe('CurrencySettingsPage — rounding increment stays clearable', () => {
  it('does not write 0.01 back into the field when the box is emptied', async () => {
    const user = await openEditDialog();

    const increment = screen.getByLabelText('Rounding Increment') as HTMLInputElement;
    expect(increment.value).toBe('0.01');

    await user.clear(increment);

    expect(increment.value).toBe('');
  });

  it('does not garble a multi-digit retype (clearing 0.25 and typing 0.5 yields 0.5, not 0.010.5)', async () => {
    const user = await openEditDialog();

    const increment = screen.getByLabelText('Rounding Increment') as HTMLInputElement;
    await user.clear(increment);
    await user.type(increment, '0.5');

    expect(increment.value).toBe('0.5');
  });
});

describe('CurrencySettingsPage — rounding increment reaches the API as a number', () => {
  it('sends the retyped rounding increment as the correct number, not a garbled one', async () => {
    const user = await openEditDialog();

    const increment = screen.getByLabelText('Rounding Increment') as HTMLInputElement;
    await user.clear(increment);
    await user.type(increment, '0.5');

    await user.click(screen.getByRole('button', { name: 'save' }));

    await waitFor(() => expect(mutateUpdate).toHaveBeenCalled());
    const call = mutateUpdate.mock.calls[0][0];

    expect(call.data.roundingIncrement).toBe(0.5);
    expect(typeof call.data.roundingIncrement).toBe('number');
  });

  it('disables Save while the box is empty, rather than silently falling back to a default', async () => {
    const user = await openEditDialog();

    const increment = screen.getByLabelText('Rounding Increment') as HTMLInputElement;
    await user.clear(increment);

    expect(screen.getByRole('button', { name: 'save' })).toBeDisabled();
  });
});
