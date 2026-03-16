'use client';

import { useEffect, useState } from 'react';
import { Camera, CheckCircle, PenLine } from 'lucide-react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderService } from '@/services/orderService';
import { formatDateTime } from '@/utils/format';

type RouteStopData = App.Data.Route.RouteStopData;

interface ProofOfDeliveryCardProps {
  orderPublicId: string;
}

export function ProofOfDeliveryCard({ orderPublicId }: ProofOfDeliveryCardProps) {
  const { t } = useTranslation();
  const [pod, setPod] = useState<RouteStopData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    OrderService.getPod(orderPublicId).then((data) => {
      setPod(data);
      setLoading(false);
    });
  }, [orderPublicId]);

  if (loading || !pod) return null;

  const hasPod = pod.podPhotoUrl || pod.podSignatureUrl || pod.podPinVerifiedAt;
  if (!hasPod) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          {t('routes:pod.title', { defaultValue: 'Proof of Delivery' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pod.podPhotoUrl && (
          <div>
            <div className="text-muted-foreground mb-1.5 flex items-center gap-1.5 text-sm">
              <Camera className="h-4 w-4" />
              {t('routes:pod.photo_title', { defaultValue: 'Photo Proof' })}
            </div>
            <div className="relative h-48 w-full overflow-hidden rounded-lg">
              <Image
                src={pod.podPhotoUrl}
                alt={t('routes:pod.photo_title', { defaultValue: 'Photo Proof' })}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        )}

        {pod.podSignatureUrl && (
          <div>
            <div className="text-muted-foreground mb-1.5 flex items-center gap-1.5 text-sm">
              <PenLine className="h-4 w-4" />
              {t('routes:pod.signature_title', { defaultValue: 'Signature' })}
            </div>
            <div className="bg-muted relative h-32 w-full overflow-hidden rounded-lg">
              <Image
                src={pod.podSignatureUrl}
                alt={t('routes:pod.signature_title', { defaultValue: 'Signature' })}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        )}

        {pod.podPinVerifiedAt && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            {t('routes:pod.pin_verified', { defaultValue: 'PIN verified successfully' })}
          </div>
        )}

        {pod.completedAt && (
          <p className="text-muted-foreground text-xs">{formatDateTime(pod.completedAt)}</p>
        )}
      </CardContent>
    </Card>
  );
}
