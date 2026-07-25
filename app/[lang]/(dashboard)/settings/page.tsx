'use client';

import {
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
  Select,
} from '@/components/ui/select';
import { Globe, Coins, Clock, Truck, ChevronRight } from 'lucide-react';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';
import { Lang } from '@/services/langService';
import type { LangCode } from '@/stores/useLangStore';
import { usePathname } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { useSupportedVehicleTypes, useUpdateSupportedVehicleTypes } from '@/hooks/settings';
import { Enums } from '@/data/app-enums';
import { actionLabel, capitalize, vehicleTypeLabel } from '@/utils/lang';

const languageCodes = ['en', 'es', 'fr'] as const;

export default function SettingsPage() {
  const { t, ready } = useTranslation();
  const router = useLocalizedRouter();
  const pathname = usePathname();

  const { data: vehicleTypesData, isLoading: vehicleTypesLoading } = useSupportedVehicleTypes();
  const updateVehicleTypes = useUpdateSupportedVehicleTypes();

  const [supportedVehicleTypes, setSupportedVehicleTypes] = useState<string[]>([]);
  const [vehicleTypesInitialized, setVehicleTypesInitialized] = useState(false);

  // Initialize local state from fetched data
  if (vehicleTypesData && !vehicleTypesInitialized) {
    setSupportedVehicleTypes(vehicleTypesData.supportedVehicleTypes ?? []);
    setVehicleTypesInitialized(true);
  }

  const toggleVehicleType = (value: string) => {
    setSupportedVehicleTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleSaveVehicleTypes = () => {
    updateVehicleTypes.mutate(supportedVehicleTypes);
  };

  // Wait for translations to load
  if (!ready) {
    return null;
  }

  const handleLanguageChange = async (nextLang: string) => {
    // Build new path with new language
    const segments = pathname.split('/').filter(Boolean);
    const rest = segments.slice(1).join('/');
    const nextPath = `/${nextLang}${rest ? '/' + rest : ''}`;

    // Change language via service and navigate (use raw Next.js push to avoid double-prefix)
    await Lang.setActive(nextLang as LangCode);
    window.location.href = nextPath;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {t('common:settings_other', { defaultValue: 'Settings' })}
        </h1>
        <p className="text-muted-foreground">
          {t('common:settings_description', { defaultValue: 'Manage your admin preferences' })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('common:language_one', { defaultValue: 'Language' })}
          </CardTitle>
          <CardDescription>
            {t('common:language_selection', { defaultValue: 'Select your preferred language' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Label htmlFor="language">
              {t('common:language_one', { defaultValue: 'Language' })}
            </Label>
            <Select value={router.lang} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageCodes.map((code) => (
                  <SelectItem key={code} value={code}>
                    {t(`languages:${code}`, { defaultValue: code.toUpperCase() })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {t('common:supported_vehicle_types', { defaultValue: 'Supported Vehicle Types' })}
          </CardTitle>
          <CardDescription>
            {t('common:supported_vehicle_types_description', {
              defaultValue: 'Choose which vehicle types drivers can be assigned in this fleet',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {vehicleTypesLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="border-primary h-6 w-6 animate-spin rounded-full border-4 border-t-transparent" />
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.values(Enums.VehicleType).map((vt) => (
                  <div key={vt} className="flex items-center gap-2">
                    <Checkbox
                      id={`vehicle-type-${vt}`}
                      checked={supportedVehicleTypes.includes(vt)}
                      onCheckedChange={() => toggleVehicleType(vt)}
                    />
                    <Label htmlFor={`vehicle-type-${vt}`} className="font-normal">
                      {capitalize(vehicleTypeLabel(vt))}
                    </Label>
                  </div>
                ))}
              </div>
              <Button
                onClick={handleSaveVehicleTypes}
                disabled={updateVehicleTypes.isPending}
                size="sm"
              >
                {updateVehicleTypes.isPending
                  ? t('common:saving', { defaultValue: 'Saving...' })
                  : actionLabel('save')}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card
        className="hover:bg-muted/50 cursor-pointer transition-colors"
        onClick={() => router.push('/settings/currencies')}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              <CardTitle>
                {t('common:currency_settings', { defaultValue: 'Currency Settings' })}
              </CardTitle>
            </div>
            <ChevronRight className="text-muted-foreground h-5 w-5" />
          </div>
          <CardDescription>
            {t('common:currency_settings_description', {
              defaultValue: 'Manage currencies and exchange rates',
            })}
          </CardDescription>
        </CardHeader>
      </Card>
      <Card
        className="hover:bg-muted/50 cursor-pointer transition-colors"
        onClick={() => router.push('/settings/service-window')}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <CardTitle>
                {t('common:service_window', { defaultValue: 'Service Window' })}
              </CardTitle>
            </div>
            <ChevronRight className="text-muted-foreground h-5 w-5" />
          </div>
          <CardDescription>
            {t('common:service_window_description', {
              defaultValue: 'Configure operating hours for the delivery service',
            })}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
