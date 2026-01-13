import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DriverService } from '@/services/driverService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';

type UpdateDriverData = App.Data.Driver.UpdateDriverData;

export function useUpdateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDriverData }) =>
      DriverService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver updated');
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update driver');
      }
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => DriverService.destroy(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success(data.message || 'Driver deleted');
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete driver');
      }
    },
  });
}
