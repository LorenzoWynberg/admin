import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AssignDriverModal } from '../AssignDriverModal';

type FeasibilityResult = App.Data.Feasibility.FeasibilityResult;

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
  vehicleTypeLabel: (v: string | null) => String(v),
  dispatchPolicyLabel: (v: string | null) => String(v),
}));

let feasibilityQuery: {
  data: FeasibilityResult | undefined;
  isLoading: boolean;
  isError: boolean;
};

// Same seam as CreateQuoteDialog.test.tsx: the component consumes isError
// exactly as the real hook exposes it, so controlling this mock stands in
// for the endpoint succeeding, still loading, or failing.
vi.mock('@/hooks/feasibility', () => ({
  useFeasibilityCheck: () => feasibilityQuery,
}));

vi.mock('@/hooks/drivers', () => ({
  useDriverList: () => ({ data: { items: [] } }),
}));

const assignMutate = vi.fn();

vi.mock('@/hooks/orders', () => ({
  useAssignOrder: () => ({ mutate: assignMutate, isPending: false }),
}));

function renderModal() {
  return render(<AssignDriverModal order={{ publicId: 'ord-1' }} />);
}

async function openModal() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'assign_driver.button' }));
  return user;
}

beforeEach(() => {
  assignMutate.mockClear();
  feasibilityQuery = { data: undefined, isLoading: false, isError: false };
});

// The same bug family as CreateQuoteDialog: a failed check used to read
// identically to a genuine "zero candidates" result (feasibility?.candidates
// ?? [] collapses both to an empty array), which rendered "No internal
// candidates found... outsource this order elsewhere" — an unearned claim
// that could steer a real dispatch decision on a false premise.
describe('AssignDriverModal — a failed feasibility check', () => {
  it('says the check failed rather than claiming no candidates exist', async () => {
    feasibilityQuery = { data: undefined, isLoading: false, isError: true };
    renderModal();
    await openModal();

    expect(screen.getByText('quotes:feasibility.check_failed')).toBeInTheDocument();
    expect(screen.queryByText('assign_driver.no_candidates')).not.toBeInTheDocument();
  });
});

describe('AssignDriverModal — a successful check that genuinely finds no candidates', () => {
  it('still says no candidates were found — a real negative result, not a failure', async () => {
    feasibilityQuery = {
      data: { candidates: [] } as unknown as FeasibilityResult,
      isLoading: false,
      isError: false,
    };
    renderModal();
    await openModal();

    expect(screen.getByText('assign_driver.no_candidates')).toBeInTheDocument();
    expect(screen.queryByText('quotes:feasibility.check_failed')).not.toBeInTheDocument();
  });
});
