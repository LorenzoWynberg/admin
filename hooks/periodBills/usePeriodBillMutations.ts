import { PeriodBillService, type SettlePeriodBillParams } from '@/services/periodBillService';
import { useResourceMutation } from '@/hooks/useResourceMutation';

/**
 * Approving, rejecting and recording a payment all change which bills need a
 * person, so each invalidates the whole `period-bills` prefix rather than one
 * row. The comprobante is deliberately keyed outside that prefix — see
 * `useBillProof` — so an open proof is not re-fetched by an act on its bill.
 */
const BILL_MUTATION = {
  queryKey: 'period-bills',
  resource: 'period_bill',
} as const;

interface SettleArgs {
  publicId: string;
  data: SettlePeriodBillParams;
}

/** Record a payment received out of band (admin only). */
export function useSettlePeriodBill() {
  return useResourceMutation<SettleArgs>(
    ({ publicId, data }) => PeriodBillService.settle(publicId, data),
    { ...BILL_MUTATION, successAction: 'updated', errorAction: 'updating' }
  );
}

interface ApproveArgs {
  publicId: string;
  notes: string | null;
}

/** The transfer was found in the bank. */
export function useApproveDeclaration() {
  return useResourceMutation<ApproveArgs>(
    ({ publicId, notes }) => PeriodBillService.approveDeclaration(publicId, notes),
    { ...BILL_MUTATION, successAction: 'approved', errorAction: 'approving' }
  );
}

interface RejectArgs {
  publicId: string;
  notes: string;
}

/**
 * The transfer could not be found. `notes` is required rather than optional
 * because the reason reaches the customer.
 */
export function useRejectDeclaration() {
  return useResourceMutation<RejectArgs>(
    ({ publicId, notes }) => PeriodBillService.rejectDeclaration(publicId, notes),
    { ...BILL_MUTATION, successAction: 'rejected', errorAction: 'rejecting' }
  );
}
