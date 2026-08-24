export interface RefundEvidenceParams {
  method: string;
  reference?: string | null;
  proof?: File | null;
  signature?: File | null;
}

/**
 * Append the refund-evidence fields shared by "process a refund" and
 * "approve a refund request" to a multipart form body.
 */
export function appendRefundEvidence(formData: FormData, data: RefundEvidenceParams): void {
  formData.append('method', data.method);
  if (data.reference) formData.append('reference', data.reference);
  if (data.proof) formData.append('proof', data.proof);
  if (data.signature) formData.append('signature', data.signature);
}
