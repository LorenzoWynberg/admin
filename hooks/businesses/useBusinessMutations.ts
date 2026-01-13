import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BusinessService } from '@/services/businessService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';

type UpdateBusinessData = App.Data.Business.UpdateBusinessData;

export function useUpdateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBusinessData }) =>
      BusinessService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      toast.success('Business updated');
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update business');
      }
    },
  });
}

export function useDeleteBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => BusinessService.destroy(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      toast.success(data.message || 'Business deleted');
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete business');
      }
    },
  });
}
