import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RouteService } from '@/services/routeService';
import { isApiError } from '@/lib/api/error';
import { crudErrorMessage, crudSuccessMessage } from '@/utils/lang';
import { toast } from 'sonner';

export function useCreateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      date: string;
      driverId?: number | null;
      notes?: string | null;
    }) => RouteService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      toast.success(crudSuccessMessage('created', 'route'));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('creating', 'route'));
      }
    },
  });
}

export function useUpdateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        date?: string;
        driverId?: number | null;
        notes?: string | null;
        status?: string;
      };
    }) => RouteService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      toast.success(crudSuccessMessage('updated', 'route'));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('updating', 'route'));
      }
    },
  });
}

export function useDeleteRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => RouteService.destroy(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      toast.success(data.message || crudSuccessMessage('deleted', 'route'));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('deleting', 'route'));
      }
    },
  });
}

export function useAddStop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      routeId,
      data,
    }: {
      routeId: string;
      data: { orderId: number; type: 'pickup' | 'dropoff' };
    }) => RouteService.addStop(routeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('creating', 'route_stop'));
      }
    },
  });
}

export function useRemoveStop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ routeId, stopId }: { routeId: string; stopId: number }) =>
      RouteService.removeStop(routeId, stopId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('deleting', 'route_stop'));
      }
    },
  });
}

export function useReorderStops() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ routeId, stopIds }: { routeId: string; stopIds: number[] }) =>
      RouteService.reorderStops(routeId, stopIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('updating', 'route'));
      }
    },
  });
}
