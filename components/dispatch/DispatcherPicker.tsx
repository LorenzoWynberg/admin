'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { Headset } from 'lucide-react';
import { useDispatchUsers } from '@/hooks/users';

const UNASSIGNED_VALUE = 'none';

interface DispatcherPickerProps {
  dispatcherId: number | null | undefined;
  onChange: (dispatcherId: number | null) => void;
  isPending?: boolean;
}

/**
 * Admin-only card that assigns a user or business to a dispatcher's book.
 * Callers gate rendering behind `useRole().isAdmin` — mirrors the API, where
 * only an admin may set `dispatcherId` on a user or business.
 */
export function DispatcherPicker({ dispatcherId, onChange, isPending }: DispatcherPickerProps) {
  const { t } = useTranslation();
  const { data: dispatchersData, isLoading } = useDispatchUsers();
  const dispatchers = dispatchersData?.items ?? [];

  const value = dispatcherId != null ? String(dispatcherId) : UNASSIGNED_VALUE;

  const handleChange = (next: string) => {
    onChange(next === UNASSIGNED_VALUE ? null : Number(next));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Headset className="h-5 w-5" />
          {t('common:dispatcher.title', { defaultValue: 'Dispatcher' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={value} onValueChange={handleChange} disabled={isPending || isLoading}>
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={t('common:dispatcher.placeholder', {
                defaultValue: 'Select dispatcher',
              })}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNASSIGNED_VALUE}>
              {t('common:none', { defaultValue: 'None' })}
            </SelectItem>
            {dispatchers.map((dispatcher) => (
              <SelectItem key={dispatcher.id} value={String(dispatcher.id)}>
                {dispatcher.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
