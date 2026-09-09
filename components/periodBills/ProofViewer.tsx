'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Loader2 } from 'lucide-react';

import {
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Dialog,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useBillProof } from '@/hooks/periodBills';
import { validationAttribute } from '@/utils/lang';

interface ProofViewerProps {
  publicId: string;
}

/**
 * The comprobante, opened through the **authenticated stream route**.
 *
 * `PeriodBillData.proofUrl` names `GET period-bills/{bill}/proof`, which sits
 * behind `auth:sanctum` on a private disk. Handed to an `<img src>` or an
 * `<a href>` the browser sends no Authorization header and the api answers
 * 401 — so nothing here ever points the DOM at that url. The bytes are pulled
 * with the token attached and rendered from an object URL.
 *
 * Corroboration, not evidence: an operator confirms a payment by finding it in
 * the bank against the reference and the amount. The image is what makes that
 * search quick, not what settles the question — so it loads only when asked
 * for, and its absence never blocks a verification.
 */
export function ProofViewer({ publicId }: ProofViewerProps) {
  const { t } = useTranslation('payments');
  const [open, setOpen] = useState(false);
  const proof = useBillProof(publicId, open);

  const label = validationAttribute('proof');
  const isPdf = proof.contentType === 'application/pdf';

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <FileText className="mr-1 h-4 w-4" />
        {t('proof')}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>{t('period_bill.awaiting_verification_hint')}</DialogDescription>
          </DialogHeader>

          {proof.isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {/* A load FAILURE, never an absence. This viewer only mounts when
              `proofUrl` is set, so the api has already said a comprobante
              exists — "no proof is attached" is the one thing that cannot be
              true here, and told it an operator would stop looking instead of
              retrying a 401 or a dropped connection. */}
          {proof.isError && (
            <p className="text-muted-foreground py-12 text-center text-sm">
              {t('resource:failed_to_load', { resource: validationAttribute('proof', false) })}
            </p>
          )}

          {proof.url &&
            (isPdf ? (
              <object data={proof.url} type="application/pdf" className="h-[70vh] w-full">
                <a href={proof.url} download>
                  {label}
                </a>
              </object>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- an object URL over fetched bytes; next/image optimizes remote urls it can re-request, and this one is revoked on unmount
              <img src={proof.url} alt={label} className="max-h-[70vh] w-full object-contain" />
            ))}
        </DialogContent>
      </Dialog>
    </>
  );
}
