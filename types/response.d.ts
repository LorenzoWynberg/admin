declare namespace Api.Response {
  interface Common {
    message: string;
    status: number;
    extra: Record<string, unknown>;
  }

  interface SimplePaginatorMeta {
    from: number | null;
    to: number | null;
    path: string;
    perPage: number;
    firstPageUrl: string;
    currentPageUrl: string;
    currentPage: number;
    nextPageUrl: string | null;
    prevPageUrl: string | null;
  }

  interface LengthAwarePaginatorMeta {
    from: number | null;
    to: number | null;
    path: string;
    perPage: number;
    firstPageUrl: string;
    prevPageUrl: string | null;
    currentPage: number;
    nextPageUrl: string | null;
    lastPage: number;
    lastPageUrl: string;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    total: number;
  }

  interface CursorPaginatorMeta {
    path: string;
    perPage: number;
    nextCursor: string | null;
    nextPageUrl: string | null;
    prevCursor: string | null;
    prevPageUrl: string | null;
  }

  export type SuccessBasic = Common;

  export interface Single<T> extends SuccessBasic {
    item: T;
  }

  export interface Multiple<T> extends SuccessBasic {
    items: T[];
  }

  export interface SimplePaginated<T> extends SuccessBasic {
    items: T[];
    meta: SimplePaginatorMeta;
  }

  export interface Paginated<T> extends SuccessBasic {
    items: T[];
    meta: LengthAwarePaginatorMeta;
  }

  export interface CursorPaginated<T> extends SuccessBasic {
    items: T[];
    meta: CursorPaginatorMeta;
  }

  export interface Error extends Common {
    details?: string | null;
    errors?: Record<string, string[]>;
  }

  export interface Login extends SuccessBasic {
    token: string;
  }
}
