import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { isApiError } from '@/lib/api/error';
import { crudErrorMessage, crudSuccessMessage } from '@/utils/lang';

interface ResourceMutationOptions {
  /** The query-key prefix to invalidate once the act succeeds. */
  queryKey: string;
  /** The `models:*` key naming what was acted on, for the toast. */
  resource: string;
  /** A `common:actions.*` past-tense key — `created`, `updated`, `rejected`. */
  successAction: string;
  /** The matching `resource:error.*` key — `creating`, `updating`, `rejecting`. */
  errorAction: string;
}

/**
 * A write against one resource: invalidate its queries, then say what happened.
 *
 * The api refuses these for reasons an operator can act on — a currency a bill
 * cannot settle in, a destination belonging to another method, a bucket still
 * open — and each refusal arrives already translated. Surfacing the api's own
 * message rather than a generic "error updating" keeps the only part that says
 * what to change.
 */
export function useResourceMutation<TArgs>(
  act: (args: TArgs) => Promise<unknown>,
  { queryKey, resource, successAction, errorAction }: ResourceMutationOptions
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: act,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast.success(crudSuccessMessage(successAction, resource));
    },
    onError: (error) => {
      if (isApiError(error)) {
        toast.error(error.message);
      } else {
        toast.error(crudErrorMessage(errorAction, resource));
      }
    },
  });
}
