'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Receipt } from 'lucide-react';
import { capitalize } from '@/utils/lang';

type TaxProfileData = App.Data.TaxProfile.TaxProfileData;

const TIPO_LABELS: Record<string, string> = {
  '01': 'fisica',
  '02': 'juridica',
  '03': 'dimex',
  '04': 'nite',
  '05': 'extranjero',
};

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || '-'}</span>
    </div>
  );
}

export function TaxProfileCard({ taxProfile }: { taxProfile: TaxProfileData }) {
  const { t } = useTranslation('tax');

  const tipoKey = TIPO_LABELS[taxProfile.tipoIdentificacion] ?? taxProfile.tipoIdentificacion;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          {capitalize(t('perfil_fiscal'))}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{capitalize(t('tipo_identificacion'))}</span>
          <Badge variant="outline">{capitalize(t(`tipos.${tipoKey}`))}</Badge>
        </div>
        <Field label={capitalize(t('cedula'))} value={taxProfile.cedula} />
        <Field label={capitalize(t('nombre_registrado'))} value={taxProfile.nombreRegistrado} />
        <Field label={capitalize(t('direccion_exacta'))} value={taxProfile.direccionExacta} />
        {taxProfile.telefonoNumero && (
          <Field
            label={capitalize(t('telefono'))}
            value={`+${taxProfile.telefonoCodigoPais} ${taxProfile.telefonoNumero}`}
          />
        )}

        {taxProfile.activities.length > 0 && (
          <div>
            <span className="text-muted-foreground text-sm">
              {capitalize(t('actividades_economicas'))}
            </span>
            <div className="mt-2 space-y-1">
              {taxProfile.activities.map((activity) => (
                <div key={activity.code} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground font-mono">{activity.code}</span>
                  <span>{activity.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
