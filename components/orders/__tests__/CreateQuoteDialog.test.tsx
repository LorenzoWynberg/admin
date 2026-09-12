import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CreateQuoteDialog } from '../CreateQuoteDialog';
import { Enums } from '@/data/app-enums';

type FeasibilityResult = App.Data.Feasibility.FeasibilityResult;
type DriverCandidate = App.Data.Feasibility.DriverCandidate;

// Radix's Dialog relies on pointer capture, which happy-dom doesn't
// implement — without these, interactions inside it silently no-op under
// test, though everything works fine in a real browser.
beforeAll(() => {
  window.HTMLElement.prototype.hasPointerCapture = () => false;
  window.HTMLElement.prototype.releasePointerCapture = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/utils/lang', () => ({
  actionLabel: (key: string) => key,
  validationAttribute: (key: string) => key,
}));

let feasibilityQuery: {
  data: FeasibilityResult | undefined;
  isLoading: boolean;
  isError: boolean;
};

// The seam this suite exercises: the dialog consumes isError/data exactly as
// the real hook exposes them (it needs no change — see hooks/feasibility),
// so controlling this mock's return value stands in for the endpoint
// succeeding, still loading, or failing.
vi.mock('@/hooks/feasibility', () => ({
  useFeasibilityCheck: () => feasibilityQuery,
}));

const createQuoteMutate = vi.fn();
const sendQuoteMutate = vi.fn();

vi.mock('@/hooks/quotes', () => ({
  useCreateQuote: () => ({ mutate: createQuoteMutate, isPending: false }),
  useSendQuote: () => ({ mutate: sendQuoteMutate, isPending: false }),
}));

vi.mock('@/hooks/orders', () => ({
  useCalculateDistance: () => ({ mutate: vi.fn(), isPending: false, data: undefined }),
  useChangeTier: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/pricing', () => ({
  useCalculatePricing: () => ({
    data: {
      serviceFee: 0,
      distanceFee: 100,
      multiplier: 1,
      subtotal: 100,
      taxRate: 0.13,
      tax: 13,
      total: 113,
    },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/currencies', () => ({
  useCurrencyList: () => ({ data: { items: [] } }),
}));

vi.mock('@/hooks/settings', () => ({
  useIdleTime: () => ({ data: undefined }),
}));

// Stubbed so its own data hooks (drivers, schedules, routes) never need
// wiring — this suite is only about what suggestedDriverId it is handed.
vi.mock('../QuoteDriverSelector', () => ({
  QuoteDriverSelector: ({ suggestedDriverId }: { suggestedDriverId: number | null }) => (
    <div data-testid="driver-selector">suggested:{String(suggestedDriverId)}</div>
  ),
}));

function driverCandidate(overrides: Partial<DriverCandidate> = {}): DriverCandidate {
  return {
    driverId: 42,
    driverName: 'Ada',
    extraDistanceKm: 0,
    suggestedPickup: '2026-09-11T14:00:00+00:00',
    suggestedDelivery: '2026-09-11T16:00:00+00:00',
    score: 1,
    travelTimeMinutes: 20,
    vehicleType: null,
    dispatchPolicy: null,
    onboardLoad: 0,
    ...overrides,
  };
}

function renderDialog() {
  return render(<CreateQuoteDialog orderId={1} orderPublicId="ord-1" orderDistanceKm={10} />);
}

async function openDialog() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'quotes:create.button' }));
  return user;
}

beforeEach(() => {
  createQuoteMutate.mockClear();
  sendQuoteMutate.mockClear();
  feasibilityQuery = { data: undefined, isLoading: false, isError: false };
});

// The defect this slice fixes: a 500 from GET orders/{order}/feasibility used
// to return no data, and the dialog silently fell back to getDefaultFormData's
// hardcoded now+2h / now+4h placeholders — which then got persisted onto real
// quotes as pickup/delivery times. These tests hold the error path itself,
// not just the (already-working) success path.
describe('CreateQuoteDialog — a failed feasibility check', () => {
  it('shows the failure state and leaves the proposed times blank rather than the generated placeholders', async () => {
    feasibilityQuery = { data: undefined, isLoading: false, isError: true };
    renderDialog();
    await openDialog();

    expect(screen.getByText('quotes:feasibility.check_failed')).toBeInTheDocument();
    expect(screen.getByText('quotes:feasibility.check_failed_hint')).toBeInTheDocument();
    expect(screen.queryByText('quotes:feasibility.checking')).not.toBeInTheDocument();

    // No generated now+2h/now+4h time reaches the display — it shows the
    // dialog's own "unknown" placeholder instead.
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getAllByText('—').length).toBeGreaterThanOrEqual(2);

    // No driver suggestion is invented from the failed check either.
    expect(screen.queryByTestId('driver-selector')).not.toBeInTheDocument();

    // A quote can't be created or sent with no proposed times.
    expect(screen.getByRole('button', { name: 'quotes:create.save_draft' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'quotes:create.create_send' })).toBeDisabled();
  });

  it('starts the manual time editor blank, not pre-filled with an invented time', async () => {
    feasibilityQuery = { data: undefined, isLoading: false, isError: true };
    renderDialog();
    const user = await openDialog();

    await user.click(screen.getByRole('button', { name: 'edit' }));

    const pickupInput = screen.getByLabelText('quotes:create.proposed_pickup') as HTMLInputElement;
    const deliveryInput = screen.getByLabelText(
      'quotes:create.proposed_delivery'
    ) as HTMLInputElement;
    expect(pickupInput.value).toBe('');
    expect(deliveryInput.value).toBe('');
  });

  it('still lets an admin create a quote by entering both times by hand', async () => {
    feasibilityQuery = { data: undefined, isLoading: false, isError: true };
    renderDialog();
    const user = await openDialog();

    await user.click(screen.getByRole('button', { name: 'edit' }));

    const pickupInput = screen.getByLabelText('quotes:create.proposed_pickup');
    const deliveryInput = screen.getByLabelText('quotes:create.proposed_delivery');
    fireEvent.change(pickupInput, { target: { value: '2026-09-12T09:00' } });
    fireEvent.change(deliveryInput, { target: { value: '2026-09-12T11:00' } });

    const saveButton = screen.getByRole('button', { name: 'quotes:create.save_draft' });
    expect(saveButton).toBeEnabled();
    await user.click(saveButton);

    expect(createQuoteMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        pickupProposedFor: expect.stringContaining('2026-09-12T09:00'),
        deliveryProposedFor: expect.stringContaining('2026-09-12T11:00'),
      }),
      expect.anything()
    );
  });

  // The race the letter of the earlier fix missed: switching to manual entry
  // while the check is still loading seeds the fields from the invented
  // default (unrelated to this slice — that's the untouched loading path).
  // If the check then fails, that leftover default must not keep sitting in
  // the fields next to a banner that says no time was suggested.
  it('scrubs a leftover invented default if the check fails after the admin already switched to manual entry', async () => {
    feasibilityQuery = { data: undefined, isLoading: true, isError: false };
    const { rerender } = renderDialog();
    const user = await openDialog();

    await user.click(screen.getByRole('button', { name: 'edit' }));
    const pickupInput = screen.getByLabelText('quotes:create.proposed_pickup') as HTMLInputElement;
    const deliveryInput = screen.getByLabelText(
      'quotes:create.proposed_delivery'
    ) as HTMLInputElement;
    expect(pickupInput.value).not.toBe('');
    expect(deliveryInput.value).not.toBe('');

    feasibilityQuery = { data: undefined, isLoading: false, isError: true };
    rerender(<CreateQuoteDialog orderId={1} orderPublicId="ord-1" orderDistanceKm={10} />);

    await waitFor(() => expect(pickupInput.value).toBe(''));
    expect(deliveryInput.value).toBe('');
  });
});

describe('CreateQuoteDialog — a successful feasibility check', () => {
  it('uses the real suggestion for times and driver, untouched by the failure-path guard', async () => {
    feasibilityQuery = {
      isLoading: false,
      isError: false,
      data: {
        level: Enums.FeasibilityLevel.Green,
        candidates: [driverCandidate({ driverId: 7 })],
        outsourceRequired: false,
        suggestedPickup: '2026-09-11T14:00:00+00:00',
        suggestedDelivery: '2026-09-11T16:00:00+00:00',
        windowStart: null,
        windowEnd: null,
        timeSensitive: false,
        planningMode: false,
        driversEvaluated: 3,
      } as unknown as FeasibilityResult,
    };
    renderDialog();
    await openDialog();

    expect(screen.queryByText('quotes:feasibility.check_failed')).not.toBeInTheDocument();
    expect(await screen.findByTestId('driver-selector')).toHaveTextContent('suggested:7');
    expect(screen.getByRole('button', { name: 'quotes:create.save_draft' })).toBeEnabled();
  });
});
