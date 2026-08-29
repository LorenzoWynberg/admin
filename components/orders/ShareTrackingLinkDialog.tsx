'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Ban, Check, Copy, Link2, Loader2, RotateCw } from 'lucide-react';
import { useMintShareLink, useRevokeShareLink, useShareLinkStatus } from '@/hooks/orders';
import { isApiError } from '@/lib/api/error';
import { actionLabel } from '@/utils/lang';
import { formatDateTime } from '@/utils/format';

interface ShareTrackingLinkDialogProps {
  orderPublicId: string;
}

/**
 * Lets staff mint, inspect, and revoke a customer-facing tracking link for
 * an order. `GET /orders/{order}/share` only ever reports whether a link is
 * active and when it expires — the plaintext URL exists exactly once, in the
 * mint response — so the just-minted URL is held in local state rather than
 * the query cache. It survives the dialog being closed and reopened (this
 * component stays mounted), but not a page reload or another admin opening
 * the same order: neither can recover it, only a fresh mint can.
 */
export function ShareTrackingLinkDialog({ orderPublicId }: ShareTrackingLinkDialogProps) {
  const { t } = useTranslation('orders');
  const [open, setOpen] = useState(false);
  const [confirmingRotate, setConfirmingRotate] = useState(false);
  const [mintedUrl, setMintedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    data: shareStatus,
    isLoading,
    isError,
    error: statusError,
  } = useShareLinkStatus({
    publicId: orderPublicId,
    enabled: open,
  });
  const mintShareLink = useMintShareLink();
  const revokeShareLink = useRevokeShareLink();

  const hasActiveLink = !!shareStatus;
  const isPending = mintShareLink.isPending || revokeShareLink.isPending;

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setConfirmingRotate(false);
      setCopied(false);
    }
    setOpen(isOpen);
  };

  const handleMintClick = () => {
    // Minting again silently kills the link a customer may already be
    // holding — require a second, explicit click when one is active.
    if (hasActiveLink && !confirmingRotate) {
      setConfirmingRotate(true);
      return;
    }
    setConfirmingRotate(false);
    setCopied(false);
    mintShareLink.mutate(orderPublicId, {
      onSuccess: (data) => setMintedUrl(data.shareUrl),
    });
  };

  const handleRevoke = () => {
    revokeShareLink.mutate(orderPublicId, {
      onSuccess: () => {
        setMintedUrl(null);
        setConfirmingRotate(false);
      },
    });
  };

  const handleCopy = async () => {
    if (!mintedUrl) return;
    try {
      await navigator.clipboard.writeText(mintedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission denied or unavailable — the URL is still
      // visible and selectable, so it can still be copied by hand.
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Link2 className="mr-1 h-4 w-4" />
          {t('share.button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('share.title')}</DialogTitle>
          <DialogDescription>{t('share.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('common:loading')}
            </div>
          ) : isError ? (
            <div className="border-destructive/30 bg-destructive/10 flex items-start gap-2 rounded-md border p-3">
              <AlertTriangle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-destructive text-sm">
                {isApiError(statusError) ? statusError.message : t('share.status_load_error')}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {hasActiveLink ? (
                <Badge
                  variant="outline"
                  className="border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                >
                  {t('share.status_active')}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  {t('share.status_none')}
                </Badge>
              )}
              {hasActiveLink && shareStatus?.shareExpiresAt && (
                <span className="text-muted-foreground text-sm">
                  {t('share.expires_label')} {formatDateTime(shareStatus.shareExpiresAt)}
                </span>
              )}
            </div>
          )}

          {hasActiveLink && mintedUrl && (
            <div className="space-y-1.5">
              <Label htmlFor="share-url">{t('share.url_label')}</Label>
              <div className="flex gap-2">
                <Input
                  id="share-url"
                  readOnly
                  value={mintedUrl}
                  onFocus={(e) => e.target.select()}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  aria-label={t('share.copy_button')}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  {t('share.copied')}
                </p>
              )}
            </div>
          )}

          {hasActiveLink && !mintedUrl && !isLoading && (
            <p className="text-muted-foreground text-sm">{t('share.url_hidden_notice')}</p>
          )}

          {confirmingRotate && (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                {t('share.rotate_warning')}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {hasActiveLink ? (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:text-destructive mr-auto"
              onClick={handleRevoke}
              disabled={isPending}
            >
              <Ban className="mr-1 h-4 w-4" />
              {t('share.revoke_button')}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            {confirmingRotate && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmingRotate(false)}
                disabled={isPending}
              >
                {actionLabel('cancel')}
              </Button>
            )}
            <Button
              type="button"
              variant={confirmingRotate ? 'destructive' : 'default'}
              onClick={handleMintClick}
              disabled={isPending || isLoading || isError}
            >
              {mintShareLink.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RotateCw className="mr-1 h-4 w-4" />
              )}
              {hasActiveLink
                ? confirmingRotate
                  ? t('share.confirm_rotate')
                  : t('share.rotate_button')
                : t('share.create_button')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
