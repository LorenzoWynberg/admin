import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PricingService } from '@/services/pricingService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { useTranslation } from 'react-i18next';
import { crudErrorMessage, crudSuccessMessage } from '@/utils/lang';

type StorePricingRuleData = App.Data.Pricing.StorePricingRuleData;
type UpdatePricingRuleData = App.Data.Pricing.UpdatePricingRuleData;

export function useCreatePricingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StorePricingRuleData) => PricingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      toast.success(crudSuccessMessage('created', 'pricing_rule'));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('creating', 'pricing_rule'));
      }
    },
  });
}

export function useUpdatePricingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePricingRuleData }) =>
      PricingService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      toast.success(crudSuccessMessage('updated', 'pricing_rule'));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('updating', 'pricing_rule'));
      }
    },
  });
}

export function useDeletePricingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => PricingService.destroy(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      toast.success(data.message || crudSuccessMessage('deleted', 'pricing_rule'));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('deleting', 'pricing_rule'));
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
        toast.error(crudErrorMessage('updating', 'pricing_rule'));
      }
    },
  });
}

export function useClonePricingRule() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('pricing');

  return useMutation({
    mutationFn: ({ id, name }: { id: number; name?: string }) => PricingService.clone(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
      toast.success(t('cloned'));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('creating', 'pricing_rule'));
      }
    },
  });
}
