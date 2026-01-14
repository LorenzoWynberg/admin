'use client';

import { useTranslation } from 'react-i18next';
import { useParams, useRouter, usePathname } from 'next/navigation';
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
import { i18n } from '@/config/i18next';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
];

export default function SettingsPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentLang = (params?.lang as string) || 'en';

  const handleLanguageChange = async (nextLang: string) => {
    // Build new path with new language
    const segments = pathname.split('/').filter(Boolean);
    const rest = segments.slice(1).join('/');
    const nextPath = `/${nextLang}${rest ? '/' + rest : ''}`;

    // Change i18next language and navigate
    await i18n.changeLanguage(nextLang);
    router.push(nextPath);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('common:settings_one', { defaultValue: 'Settings' })}</h1>
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
            <Label htmlFor="language">{t('common:language_one', { defaultValue: 'Language' })}</Label>
            <Select value={currentLang} onValueChange={handleLanguageChange}>
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
