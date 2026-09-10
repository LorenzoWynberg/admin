'use client';

import { useTranslation } from 'react-i18next';
import { ImageOff, Loader2 } from 'lucide-react';

import { useAuthorizedFile } from '@/hooks/useAuthorizedFile';

interface EvidenceImageProps {
  /** The authorized route the image is served from. */
  source: string;
  /** Alt text, and the tooltip on a failed load. */
  alt: string;
  /** Names the file in "Failed to load :resource" — pass it lowercase. */
  resourceLabel: string;
  /** How the image fills its box — `object-cover` for a photo, `object-contain` for a signature. */
  className: string;
  /** Drop the message text where the box is too small to read it (a thumbnail). */
  compact?: boolean;
}

/**
 * An evidence image shown inline, fetched through its authorized route.
 *
 * Fills its parent, which owns the box and the rounding. All three states —
 * loading, failed, loaded — occupy that same box, so the layout does not move
 * as the bytes arrive.
 */
export function EvidenceImage({
  source,
  alt,
  resourceLabel,
  className,
  compact = false,
}: EvidenceImageProps) {
  const { t } = useTranslation();
  const file = useAuthorizedFile(source);

  const failed = t('resource:failed_to_load', { resource: resourceLabel });

  if (file.isError) {
    return (
      <div
        className="text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center"
        title={failed}
      >
        <ImageOff className="h-5 w-5 shrink-0" />
        {/* The words are the same either way; a thumbnail only has room for
            the tooltip and the screen reader, not for the line itself. */}
        {compact ? (
          <span className="sr-only">{failed}</span>
        ) : (
          <span className="text-xs">{failed}</span>
        )}
      </div>
    );
  }

  if (!file.url) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
        <span className="sr-only">{t('common:loading')}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- an object URL over fetched bytes; next/image optimizes remote urls it can re-request, and this one is revoked on unmount
    <img src={file.url} alt={alt} className={className} />
  );
}
