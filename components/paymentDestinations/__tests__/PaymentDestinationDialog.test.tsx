import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PaymentDestinationDialog } from '../PaymentDestinationDialog';
import { Enums } from '@/data/app-enums';

type PaymentDestinationData = App.Data.PaymentDestination.PaymentDestinationData;

// Radix's Select opens by capturing the pointer on the trigger, which
// happy-dom doesn't implement — without these the popover silently never
// opens under test, though it works fine in a real browser.
beforeAll(() => {
  window.HTMLElement.prototype.hasPointerCapture = () => false;
  window.HTMLElement.prototype.releasePointerCapture = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
});

const createMutate = vi.fn();
const updateMutate = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/utils/lang', () => ({
  actionLabel: (key: string) => key,
  resourceMessage: (key: string) => key,
  validationAttribute: (key: string) => key,
}));

vi.mock('@/hooks/paymentDestinations', () => ({
  useCreatePaymentDestination: () => ({ mutate: createMutate, isPending: false }),
  useUpdatePaymentDestination: () => ({ mutate: updateMutate, isPending: false }),
}));

vi.mock('@/hooks/currencies', () => ({
  useCurrencyList: () => ({
    data: { items: [{ code: 'CRC', symbol: '₡', isEnabled: true }] },
  }),
}));

// `data/app-enums.ts` holds plain string constants; `generated.d.ts` declares
// nominal TS enums over the same values, and the two are deliberately not
// assignable to each other. Production code never needs the bridge — it reads
// these values off DTOs, where they already carry the nominal type — so
// fixtures cross that boundary once, here.
const sinpeRow = {
  id: 5,
  method: Enums.SettlementMethod.SinpeMobile,
  phoneNumber: '8888-8888',
  holderName: 'Mandados SA',
  legalId: '3-101-999',
  active: true,
} as PaymentDestinationData;

function open(destination?: PaymentDestinationData) {
  return render(<PaymentDestinationDialog destination={destination} open onOpenChange={vi.fn()} />);
}

beforeEach(() => {
  createMutate.mockClear();
  updateMutate.mockClear();
});

describe('PaymentDestinationDialog — the fields a method admits', () => {
  // Every sibling field is `prohibited` on the api side, so sending a bank name
  // on a SINPE row fails the whole request rather than being ignored.
  it('asks a SINPE destination for a phone number and nothing bank-shaped', () => {
    open(sinpeRow);

    expect(screen.getByLabelText('phoneNumber')).toBeInTheDocument();
    expect(screen.queryByLabelText('bankName')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('accountNumber')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('iban')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('currencyCode')).not.toBeInTheDocument();
  });

  it('asks a transfer destination for bank details and no phone number', () => {
    open();

    expect(screen.getByLabelText('bankName')).toBeInTheDocument();
    expect(screen.getByLabelText('accountNumber')).toBeInTheDocument();
    expect(screen.getByLabelText('iban')).toBeInTheDocument();
    expect(screen.queryByLabelText('phoneNumber')).not.toBeInTheDocument();
  });

  it('sends only the fields the chosen method admits', async () => {
    const user = userEvent.setup();
    open(sinpeRow);

    await user.click(screen.getByRole('button', { name: 'save' }));

    expect(updateMutate).toHaveBeenCalledTimes(1);
    const [args] = updateMutate.mock.calls[0];
    expect(args.data).toHaveProperty('phoneNumber', '8888-8888');
    expect(args.data).not.toHaveProperty('bankName');
    expect(args.data).not.toHaveProperty('accountNumber');
    expect(args.data).not.toHaveProperty('currencyCode');
  });
});

describe('PaymentDestinationDialog — the method is immutable once created', () => {
  // Changing it in place would leave a row carrying the wrong method's fields;
  // the api answers `'method' => prohibited` on the update DTO. Swapping means
  // deactivating and creating a new one.
  it('locks the method on an existing destination', () => {
    open(sinpeRow);

    expect(screen.getByLabelText('method')).toBeDisabled();
  });

  it('leaves the method open on a new destination', () => {
    open();

    expect(screen.getByLabelText('method')).not.toBeDisabled();
  });

  it('never sends a method on an update', async () => {
    const user = userEvent.setup();
    open(sinpeRow);

    await user.click(screen.getByRole('button', { name: 'save' }));

    expect(updateMutate.mock.calls[0][0].data).not.toHaveProperty('method');
  });
});

describe('PaymentDestinationDialog — refusing what the api would refuse', () => {
  it('will not save a transfer destination missing its required bank fields', () => {
    open();

    expect(screen.getByRole('button', { name: 'save' })).toBeDisabled();
  });

  it('saves a complete SINPE destination', async () => {
    const user = userEvent.setup();
    open(sinpeRow);

    expect(screen.getByRole('button', { name: 'save' })).not.toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'save' }));

    expect(createMutate).not.toHaveBeenCalled();
    expect(updateMutate).toHaveBeenCalled();
  });
});
