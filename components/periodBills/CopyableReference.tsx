'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { crudErrorMessage, validationAttribute } from '@/utils/lang';

interface CopyableReferenceProps {
  reference: string;
}

/**
 * The reference the customer gave, in a form an operator can paste straight
 * into a bank's search box.
 *
 * Copyable rather than merely displayed because this is the whole point of the
 * verification row: finding the transfer in the bank is a search on this exact
 * string, and re-typing it by eye is where a verification goes wrong.
 */
export function CopyableReference({ reference }: CopyableReferenceProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // The clipboard write rejects outright when the permission is denied, and
    // an unhandled rejection here would leave the operator with a button that
    // silently did nothing. Guarded the way ShareTrackingLinkDialog guards its
    // own copy.
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(crudErrorMessage('updating', 'period_bill'));
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-xs">{validationAttribute('reference')}</span>
      <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm">{reference}</code>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2"
        onClick={handleCopy}
        aria-label={validationAttribute('reference')}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}
