export type Brand<Value, Name extends string> = Value & {
  readonly __brand: Name;
};

export type UserId = Brand<string, "UserId">;
export type OrganizationId = Brand<string, "OrganizationId">;
export type KrewId = Brand<string, "KrewId">;

export type AppId = "web" | "auth" | "krew" | "org" | "pwa";

export type JsonPrimitive = boolean | number | string | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
}

export interface ApiSuccess<T> {
  data: T;
  meta?: Record<string, JsonValue>;
}

export type ApiResult<T> =
  | ApiSuccess<T>
  | {
      data?: never;
      error: ApiError;
    };

export interface PageInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  pageInfo: PageInfo;
}
