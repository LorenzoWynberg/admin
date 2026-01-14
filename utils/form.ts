import type { UseFormSetError, Path, FieldValues } from 'react-hook-form';
import { toast } from 'sonner';
import { isApiError, ApiError } from '@/lib/api/error';

type ApplyErrorsOptions = {
  /**
   * Show toast on 422 validation errors (default: false, since field errors are shown)
   */
  showToastOn422?: boolean;
  /**
   * HTTP statuses that always trigger a toast
   */
  toastStatuses?: number[];
  /**
   * How to join multiple error messages for a field
   */
  joinWith?: string;
  /**
   * Default message when field has errors but no message
   */
  defaultFieldMessage?: string;
  /**
   * Default toast title for unknown errors
   */
  defaultToastTitle?: string;
  /**
   * Include error details in toast description
   */
  includeDetailsInToast?: boolean;
};

/**
 * Apply API validation errors to React Hook Form fields
 *
 * Usage:
 * ```tsx
 * const form = useForm<FormValues>();
 *
 * const onSubmit = async (values: FormValues) => {
 *   try {
 *     await api.post('/endpoint', values);
 *   } catch (err) {
 *     applyApiErrorsToForm(err, form.setError, {
 *       // Optional: map API field names to form field names
 *       from_name: 'fromName',
 *       to_name: 'toName',
 *     });
 *   }
 * };
 * ```
 */
export function applyApiErrorsToForm<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
  fieldMap: Partial<Record<string, Path<T>>> = {},
  {
    showToastOn422 = false,
    toastStatuses = [401, 403, 500, 501, 502, 503],
    joinWith = '\n',
    defaultFieldMessage = 'This field is invalid',
    defaultToastTitle = 'An error occurred',
    includeDetailsInToast = true,
  }: ApplyErrorsOptions = {}
): { appliedFieldErrors: boolean; showedToast: boolean } {
  let appliedFieldErrors = false;
  let showedToast = false;

  if (!isApiError(err)) {
    toast.error(defaultToastTitle);
    return { appliedFieldErrors: false, showedToast: true };
  }

  const apiError = err as ApiError;
  const hasErrorsObject =
    apiError.errors && typeof apiError.errors === 'object' && !Array.isArray(apiError.errors);

  // Apply field errors
  if (hasErrorsObject) {
    for (const [apiKey, raw] of Object.entries(apiError.errors!)) {
      const field = (fieldMap[apiKey] ?? apiKey) as Path<T>;
      const messages = Array.isArray(raw) ? raw : raw ? [String(raw)] : [];
      const message = messages.length ? messages.join(joinWith) : defaultFieldMessage;
      setError(field, { type: 'server', message });
      appliedFieldErrors = true;
    }
  }

  // Determine if toast should be shown
  const status = apiError.status ?? 0;
  const is422 = status === 422;
  const forceToast = toastStatuses.includes(status);

  const title = apiError.message || defaultToastTitle;
  const description = includeDetailsInToast && apiError.details ? apiError.details : undefined;

  if (!appliedFieldErrors || !is422 || showToastOn422 || forceToast) {
    toast.error(title, { description });
    showedToast = true;
  }

  return { appliedFieldErrors, showedToast };
}

/**
 * Extract first error message from ApiError for a specific field
 */
export function getFieldError(error: unknown, field: string): string | undefined {
  if (!isApiError(error)) return undefined;
  const messages = error.errors?.[field];
  return Array.isArray(messages) ? messages[0] : undefined;
}

/**
 * Check if error has validation errors for any field
 */
export function hasValidationErrors(error: unknown): boolean {
  if (!isApiError(error)) return false;
  return (
    error.errors !== undefined &&
    typeof error.errors === 'object' &&
    Object.keys(error.errors).length > 0
  );
}
