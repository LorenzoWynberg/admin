'use client';

import {
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
  Select,
} from '@/components/ui/select';
import { Globe, Coins, ChevronRight } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { Lang } from '@/services/langService';
import type { LangCode } from '@/stores/useLangStore';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const languageCodes = ['en', 'es', 'fr'] as const;

export default function SettingsPage() {
  const { t, ready } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentLang = (params?.lang as string) || 'en';

  // Wait for translations to load
  if (!ready) {
    return null;
  }

  const handleLanguageChange = async (nextLang: string) => {
    // Build new path with new language
    const segments = pathname.split('/').filter(Boolean);
    const rest = segments.slice(1).join('/');
    const nextPath = `/${nextLang}${rest ? '/' + rest : ''}`;

    // Change language via service and navigate
    await Lang.setActive(nextLang as LangCode);
    router.push(nextPath);
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
            <Select value={currentLang} onValueChange={handleLanguageChange}>
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

      <Card
        className="hover:bg-muted/50 cursor-pointer transition-colors"
        onClick={() => router.push(`/${currentLang}/settings/currencies`)}
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
    </div>
  );
}
