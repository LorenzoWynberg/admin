import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CatalogService } from '@/services/catalogService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { crudErrorMessage, crudSuccessMessage } from '@/utils/lang';

type StoreCatalogElementData = App.Data.CatalogElement.StoreCatalogElementData;
type UpdateCatalogElementData = App.Data.CatalogElement.UpdateCatalogElementData;

interface CreateElementParams {
  catalogId: number;
  catalogCode: string;
  data: Omit<StoreCatalogElementData, 'catalogId'>;
}

interface UpdateElementParams {
  catalogId: number;
  catalogCode: string;
  elementId: number;
  data: Omit<UpdateCatalogElementData, 'catalogId'>;
}

interface DeleteElementParams {
  catalogId: number;
  catalogCode: string;
  elementId: number;
}

export function useCreateCatalogElement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ catalogId, data }: CreateElementParams) =>
      CatalogService.createElement(catalogId, data),
    onSuccess: (_, { catalogCode }) => {
      queryClient.invalidateQueries({ queryKey: ['catalogs', 'elements', catalogCode] });
      toast.success(crudSuccessMessage('created', 'element'));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('creating', 'element'));
      }
    },
  });
}

export function useUpdateCatalogElement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ catalogId, elementId, data }: UpdateElementParams) =>
      CatalogService.updateElement(catalogId, elementId, data),
    onSuccess: (_, { catalogCode }) => {
      queryClient.invalidateQueries({ queryKey: ['catalogs', 'elements', catalogCode] });
      toast.success(crudSuccessMessage('updated', 'element'));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('updating', 'element'));
      }
    },
  });
}

export function useDeleteCatalogElement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ catalogId, elementId }: DeleteElementParams) =>
      CatalogService.deleteElement(catalogId, elementId),
    onSuccess: (_, { catalogCode }) => {
      queryClient.invalidateQueries({ queryKey: ['catalogs', 'elements', catalogCode] });
      toast.success(crudSuccessMessage('deleted', 'element'));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('deleting', 'element'));
      }
    },
  });
}
