// packages/clients/src/contracts.ts
export type ApiError = { code: string; message: string; path?: string };

export type ApiResult<T> =
  | { ok: true; data: T; errors?: undefined }
  | { ok: false; data?: undefined; errors: ApiError[] };
