'use client';

import { useTranslation } from 'react-i18next';
import { useLang } from '@/hooks/useLang';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Espanol' },
  { code: 'fr', name: 'Francais' },
];

export default function SettingsPage() {
  const { t } = useTranslation();
  const Lang = useLang();

  const handleLanguageChange = async (lang: string) => {
    await Lang.set(lang);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('common:settings', { defaultValue: 'Settings' })}</h1>
        <p className="text-muted-foreground">
          {t('common:settings_description', { defaultValue: 'Manage your admin preferences' })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('common:language', { defaultValue: 'Language' })}
          </CardTitle>
          <CardDescription>
            {t('common:language_description', { defaultValue: 'Select your preferred language' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Label htmlFor="language">{t('common:language', { defaultValue: 'Language' })}</Label>
            <Select value={Lang.active} onValueChange={handleLanguageChange} disabled={Lang.loading}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
