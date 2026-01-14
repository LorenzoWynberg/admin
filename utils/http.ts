/**
 * HTTP Response Type Guards and Helpers
 * Adapted from front-end project for admin dashboard
 */

/**
 * Type guard for responses with a single `item`
 */
export const hasItem = <T>(
  response: Api.Response.SuccessBasic | Api.Response.Single<T>,
): response is Api.Response.Single<T> => {
  return (
    typeof (response as Api.Response.Single<T>)?.item !== 'undefined' &&
    (response as Api.Response.Single<T>).item !== null
  );
};

/**
 * Type guard for responses with an array of `items`
 */
export const hasItems = <T>(
  response:
    | Api.Response.Multiple<T>
    | Api.Response.SimplePaginated<T>
    | Api.Response.Paginated<T>
    | Api.Response.CursorPaginated<T>
    | Api.Response.SuccessBasic,
): response is
  | Api.Response.Multiple<T>
  | Api.Response.SimplePaginated<T>
  | Api.Response.Paginated<T>
  | Api.Response.CursorPaginated<T> => {
  return (
    Array.isArray((response as Api.Response.Multiple<T>)?.items) &&
    (response as Api.Response.Multiple<T>).items.length > 0
  );
};

/**
 * Check if response has pagination metadata
 */
export const hasPagination = <T>(response: unknown): response is Api.Response.Paginated<T> => {
  const res = response as Api.Response.Paginated<T>;
  return (
    res?.meta !== undefined &&
    typeof res.meta.total === 'number' &&
    typeof res.meta.currentPage === 'number'
  );
};

/**
 * Create a basic success response object
 */
export const successBasic = (
  message = '',
  extra: Record<string, unknown> = {},
  status = 200,
): Api.Response.SuccessBasic => ({
  message,
  status,
  extra,
});

/**
 * Convert any response type to basic success format
 */
export const toBasicSuccess = <T>(
  response:
    | Api.Response.Single<T>
    | Api.Response.Multiple<T>
    | Api.Response.Paginated<T>
    | Api.Response.SuccessBasic,
): Api.Response.SuccessBasic => ({
  message: response.message,
  status: response.status,
  extra: response.extra,
});
