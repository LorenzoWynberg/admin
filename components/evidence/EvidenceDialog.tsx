'use client';

import { useTranslation } from 'react-i18next';
import { Download, Loader2 } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthorizedFile } from '@/hooks/useAuthorizedFile';
import { Button } from '@/components/ui/button';

interface EvidenceDialogProps {
  /** The authorized route the file is served from, or null while none is open. */
  source: string | null;
  /** Dialog title, and the name the download is saved under. */
  title: string;
  /** Names the file in "Failed to load :resource" — pass it lowercase. */
  resourceLabel: string;
  onClose: () => void;
}

/**
 * An evidence file — image or PDF — opened through its authorized route.
 *
 * Nothing here ever points the DOM at that route: the bytes are fetched with
 * the token attached and rendered from an object URL, including the download,
 * which is why the file is pulled before it can be saved rather than linked.
 *
 * A failure is reported as a **failed load, never as an absence**. This only
 * opens for a file the api has already said exists, so "there is nothing here"
 * is the one thing that cannot be true — and told it, an operator stops
 * looking instead of retrying a 401 or a dropped connection.
 */
export function EvidenceDialog({ source, title, resourceLabel, onClose }: EvidenceDialogProps) {
  const { t } = useTranslation();
  const file = useAuthorizedFile(source);
  const isPdf = file.contentType === 'application/pdf';

  return (
    <Dialog open={source !== null} onOpenChange={(open) => !open && onClose()}>
      {/* There is no prose to describe the file with — the title names it and
          the file itself is the content — so opt out explicitly rather than
          leave Radix warning about a description that should not exist. */}
      <DialogContent className="max-w-3xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="truncate pr-8">{title}</DialogTitle>
        </DialogHeader>

        {file.isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            <span className="sr-only">{t('common:loading')}</span>
          </div>
        )}

        {file.isError && (
          <p className="text-muted-foreground py-12 text-center text-sm">
            {t('resource:failed_to_load', { resource: resourceLabel })}
          </p>
        )}

        {file.url && (
          <div className="space-y-3">
            {isPdf ? (
              <object data={file.url} type="application/pdf" className="h-[70vh] w-full">
                <a href={file.url} download={title}>
                  {title}
                </a>
              </object>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- an object URL over fetched bytes; next/image optimizes remote urls it can re-request, and this one is revoked on unmount
              <img
                src={file.url}
                alt={title}
                className="max-h-[70vh] w-full rounded-md object-contain"
              />
            )}
            <div className="flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <a href={file.url} download={title}>
                  <Download className="mr-2 h-4 w-4" />
                  {/* `common:download` does not exist in the api's lang files in
                      any of the three languages. Carried over verbatim from the
                      dialog this replaces rather than invented here — a consumer
                      repo cannot add a key — so the fallback stays as the marker
                      that the key is still owed upstream. */}
                  {t('common:download', { defaultValue: 'Download' })}
                </a>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
