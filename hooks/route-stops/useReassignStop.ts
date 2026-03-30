import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RouteStopService } from '@/services/routeStopService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export function useReassignStop() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({
      stopId,
      data,
    }: {
      stopId: number;
      data: {
        targetRouteId?: number | null;
        newDriverId?: number | null;
        date?: string | null;
        optimize?: boolean;
      };
    }) => RouteStopService.reassign(stopId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      toast.success(
        t('routes:reassign.success', { defaultValue: 'Stop reassigned successfully.' })
      );
    },
  });
}

export function useFlagDelay() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ stopId, reason }: { stopId: number; reason: string }) =>
      RouteStopService.flagDelay(stopId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      toast.success(t('routes:delay.flagged', { defaultValue: 'Delay Flagged' }));
    },
  });
}
