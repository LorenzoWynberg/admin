'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { Wallet } from 'lucide-react';
import { Enums } from '@/data/app-enums';
import { validationAttribute } from '@/utils/lang';
import { getPaymentMethodLabel } from './PaymentSection';

const TOGGLEABLE_METHODS = [Enums.PaymentMethodType.Cash, Enums.PaymentMethodType.SinpeMobile];

interface PaymentMethodsCardProps {
  allowedMethods: string[] | undefined;
  onChange: (nextMethods: string[]) => void;
  isPending?: boolean;
}

export function PaymentMethodsCard({
  allowedMethods,
  onChange,
  isPending,
}: PaymentMethodsCardProps) {
  const { t } = useTranslation();
  const methods = allowedMethods ?? [];

  const handleToggle = (method: string, checked: boolean) => {
    onChange(
      checked ? Array.from(new Set([...methods, method])) : methods.filter((m) => m !== method)
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          {validationAttribute('allowedPaymentMethods', true)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {getPaymentMethodLabel(t, Enums.PaymentMethodType.Card)}
          </span>
          <Badge variant="secondary">
            {t('payments:entitlements.always_enabled', { defaultValue: 'Always enabled' })}
          </Badge>
        </div>
        {TOGGLEABLE_METHODS.map((method) => (
          <div key={method} className="flex items-center justify-between">
            <Label htmlFor={`payment-method-${method}`} className="text-sm font-medium">
              {getPaymentMethodLabel(t, method)}
            </Label>
            <Checkbox
              id={`payment-method-${method}`}
              checked={methods.includes(method)}
              disabled={isPending}
              onCheckedChange={(checked) => handleToggle(method, checked === true)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
