'use client';

import { useTranslation } from 'react-i18next';

import { validationAttribute } from '@/utils/lang';

type PeriodBillData = App.Data.PeriodBill.PeriodBillData;
type SettlementDestination = NonNullable<PeriodBillData['settlementDestination']>;

interface SettlementDestinationSummaryProps {
  destination: SettlementDestination;
}

/**
 * Where the customer was told to send the money.
 *
 * A **snapshot** the bill recorded, not a live row: destinations are edited and
 * deactivated while a bill's history must not move. It is shown because it is
 * the only record of which account an operator should be looking in — the
 * declared reference is meaningless against the wrong statement.
 */
export function SettlementDestinationSummary({ destination }: SettlementDestinationSummaryProps) {
  const { t } = useTranslation('payments');

  const fields: Array<[string, string | null]> = [
    [validationAttribute('holderName'), destination.holderName],
    [validationAttribute('legalId'), destination.legalId],
    [validationAttribute('phoneNumber'), destination.phoneNumber],
    [validationAttribute('bankName'), destination.bankName],
    [validationAttribute('accountNumber'), destination.accountNumber],
    [validationAttribute('iban'), destination.iban],
    [validationAttribute('currencyCode'), destination.currencyCode],
  ];

  return (
    <div className="bg-muted/50 space-y-1 rounded-md p-3">
      <div className="flex items-center gap-2 text-xs font-semibold">
        <span>{validationAttribute('destinationId')}</span>
        <span className="text-muted-foreground font-normal">
          {t(`settlement_method.${destination.method}`)}
        </span>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
        {fields
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-mono">{value}</dd>
            </div>
          ))}
      </dl>
    </div>
  );
}
