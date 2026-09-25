import type { ApiError } from "@krowds/types";
import { buildQueryString } from "@krowds/utils";
import { validateHttpUrl } from "@krowds/validation";

export type QueryValue = boolean | number | string | null | undefined;

export interface ApiClientOptions {
  baseUrl: string;
  defaultHeaders?: HeadersInit;
  fetch?: typeof globalThis.fetch;
  getAccessToken?: () => null | Promise<null | string> | string;
}

export interface ApiRequestOptions
  extends Omit<RequestInit, "body" | "method"> {
  accessToken?: string;
  body?: BodyInit | Record<string, unknown> | unknown[];
  method?: string;
  query?: Record<string, QueryValue>;
}

export class KrowdsApiError extends Error {
  readonly code: string;
  readonly details?: unknown;
  readonly requestId?: string;
  readonly status: number;

  constructor(status: number, error: ApiError) {
    super(error.message);
    this.name = "KrowdsApiError";
    this.code = error.code;
    this.details = error.details;
    this.requestId = error.requestId;
    this.status = status;
  }
}

export interface KrowdsApiClient {
  delete<T>(path: string, options?: ApiRequestOptions): Promise<T>;
  get<T>(path: string, options?: ApiRequestOptions): Promise<T>;
  patch<T>(
    path: string,
    body?: Record<string, unknown> | unknown[],
    options?: ApiRequestOptions,
  ): Promise<T>;
  post<T>(
    path: string,
    body?: Record<string, unknown> | unknown[],
    options?: ApiRequestOptions,
  ): Promise<T>;
  put<T>(
    path: string,
    body?: Record<string, unknown> | unknown[],
    options?: ApiRequestOptions,
  ): Promise<T>;
  request<T>(path: string, options?: ApiRequestOptions): Promise<T>;
}

function isApiError(value: unknown): value is ApiError {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ApiError>;
  return (
    typeof candidate.code === "string" && typeof candidate.message === "string"
  );
}

function isBodyInit(value: unknown): value is BodyInit {
  return (
    typeof value === "string" ||
    value instanceof URLSearchParams ||
    value instanceof FormData ||
    value instanceof Blob ||
    value instanceof ArrayBuffer
  );
}

export function createApiClient(options: ApiClientOptions): KrowdsApiClient {
  const baseUrlResult = validateHttpUrl(options.baseUrl);

  if (!baseUrlResult.success) {
    throw new TypeError(baseUrlResult.issues[0]?.message);
  }

  const baseUrl = options.baseUrl.replace(/\/+$/, "");
  const fetchImplementation = options.fetch ?? globalThis.fetch;

  async function request<T>(
    path: string,
    requestOptions: ApiRequestOptions = {},
  ): Promise<T> {
    const {
      accessToken: explicitAccessToken,
      body: requestBody,
      method,
      query: requestQuery,
      ...fetchOptions
    } = requestOptions;
    const normalizedPath = path.replace(/^\/+/, "");
    const url = new URL(`${baseUrl}/${normalizedPath}`);
    const query = buildQueryString(requestQuery ?? {});
    const headers = new Headers(options.defaultHeaders);
    const accessToken =
      explicitAccessToken ?? (await options.getAccessToken?.());

    if (accessToken && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    let body = requestBody;

    if (body !== undefined && !isBodyInit(body)) {
      body = JSON.stringify(body);
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
    }

    const response = await fetchImplementation(`${url}${query}`, {
      ...fetchOptions,
      body,
      headers,
      method: method ?? "GET",
    });
    const contentType = response.headers.get("content-type") ?? "";
    const payload: unknown = response.status === 204
      ? undefined
      : contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    if (!response.ok) {
      throw new KrowdsApiError(
        response.status,
        isApiError(payload)
          ? payload
          : {
              code: "HTTP_ERROR",
              message:
                typeof payload === "string" && payload
                  ? payload
                  : `Request failed with status ${response.status}.`,
            },
      );
    }

    return payload as T;
  }

  return {
    request,
    get: <T>(path: string, requestOptions?: ApiRequestOptions) =>
      request<T>(path, { ...requestOptions, method: "GET" }),
    post: <T>(
      path: string,
      body?: Record<string, unknown> | unknown[],
      requestOptions?: ApiRequestOptions,
    ) => request<T>(path, { ...requestOptions, body, method: "POST" }),
    put: <T>(
      path: string,
      body?: Record<string, unknown> | unknown[],
      requestOptions?: ApiRequestOptions,
    ) => request<T>(path, { ...requestOptions, body, method: "PUT" }),
    patch: <T>(
      path: string,
      body?: Record<string, unknown> | unknown[],
      requestOptions?: ApiRequestOptions,
    ) => request<T>(path, { ...requestOptions, body, method: "PATCH" }),
    delete: <T>(path: string, requestOptions?: ApiRequestOptions) =>
      request<T>(path, { ...requestOptions, method: "DELETE" }),
  };
}
