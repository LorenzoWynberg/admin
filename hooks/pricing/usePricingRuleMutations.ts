import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PricingService } from '@/services/pricingService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { useTranslation } from 'react-i18next';

type StorePricingRuleData = App.Data.Pricing.StorePricingRuleData;
type UpdatePricingRuleData = App.Data.Pricing.UpdatePricingRuleData;

export function useCreatePricingRule() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('pricing');

  return useMutation({
    mutationFn: (data: StorePricingRuleData) => PricingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      toast.success(t('resource:created', { resource: t('title') }));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(t('failed_to_load'));
      }
    },
  });
}

export function useUpdatePricingRule() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('pricing');

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePricingRuleData }) =>
      PricingService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      toast.success(t('resource:updated', { resource: t('title') }));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(t('failed_to_load'));
      }
    },
  });
}

export function useDeletePricingRule() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('pricing');

  return useMutation({
    mutationFn: (id: number) => PricingService.destroy(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      toast.success(data.message || t('resource:deleted', { resource: t('title') }));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(t('failed_to_load'));
      }
    },
  });
}

export function useActivatePricingRule() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('pricing');

  return useMutation({
    mutationFn: (id: number) => PricingService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      toast.success(t('activated'));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(t('failed_to_load'));
      }
    },
  });
}

export function useDeactivatePricingRule() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('pricing');

  return useMutation({
    mutationFn: (id: number) => PricingService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      toast.success(t('deactivated'));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(t('failed_to_load'));
      }
    },
  });
}

export function useDuplicatePricingRule() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('pricing');

  return useMutation({
    mutationFn: ({ id, name }: { id: number; name?: string }) => PricingService.duplicate(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      toast.success(t('duplicated'));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(t('failed_to_load'));
      }
    },
  });
}
