import { useMutation, useQueryClient } from '@tanstack/react-query';
import { StaffService } from '@/services/staffService';
import { toast } from 'sonner';
import { isApiError } from '@/lib/api/error';
import { crudErrorMessage, crudSuccessMessage } from '@/utils/lang';

type StoreStaffData = App.Data.User.StoreStaffData;

/**
 * Creates a `dispatch` or `admin` account. There is no `Staff` model — the
 * API creates a plain `User` row — so this keys its toast copy and cache
 * invalidation off `user`/`['users']`, the same as `useCreateDriver` keys off
 * `driver`/`['drivers']`, rather than a non-existent `models:staff` label.
 * Invalidating `['users']` also refreshes the dispatcher pickers
 * (`useDispatchUsers`), which query under the same key.
 */
export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StoreStaffData) => StaffService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(crudSuccessMessage('created', 'user'));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage('creating', 'user'));
      }
    },
  });
}
