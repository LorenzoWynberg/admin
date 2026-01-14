import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CatalogService } from '@/services/catalogService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ catalogId, data }: CreateElementParams) =>
      CatalogService.createElement(catalogId, data),
    onSuccess: (_, { catalogCode }) => {
      queryClient.invalidateQueries({ queryKey: ['catalogs', 'elements', catalogCode] });
      toast.success(t('catalogs:element_created', { defaultValue: 'Element created' }));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(
          t('catalogs:element_create_failed', { defaultValue: 'Failed to create element' }),
        );
      }
    },
  });
}

export function useUpdateCatalogElement() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ catalogId, elementId, data }: UpdateElementParams) =>
      CatalogService.updateElement(catalogId, elementId, data),
    onSuccess: (_, { catalogCode }) => {
      queryClient.invalidateQueries({ queryKey: ['catalogs', 'elements', catalogCode] });
      toast.success(t('catalogs:element_updated', { defaultValue: 'Element updated' }));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(
          t('catalogs:element_update_failed', { defaultValue: 'Failed to update element' }),
        );
      }
    },
  });
}

export function useDeleteCatalogElement() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ catalogId, elementId }: DeleteElementParams) =>
      CatalogService.deleteElement(catalogId, elementId),
    onSuccess: (_, { catalogCode }) => {
      queryClient.invalidateQueries({ queryKey: ['catalogs', 'elements', catalogCode] });
      toast.success(t('catalogs:element_deleted', { defaultValue: 'Element deleted' }));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(
          t('catalogs:element_delete_failed', { defaultValue: 'Failed to delete element' }),
        );
      }
    },
  });
}
