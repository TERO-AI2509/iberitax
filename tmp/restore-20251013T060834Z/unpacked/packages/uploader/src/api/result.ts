export type ApiOk<T> = { ok: true; data: T };
export type ApiError = {
  ok: false;
  code: "BadRequest" | "ValidationError" | "ContentTypeNotAllowed" | "FileTooLarge" | "StorageError" | "InternalError";
  error: string;
  details?: unknown;
};
export type ApiResult<T> = ApiOk<T> | ApiError;

export const ok = <T>(data: T): ApiOk<T> => ({ ok: true, data });
export const err = (code: ApiError["code"], error: string, details?: unknown): ApiError =>
  ({ ok: false, code, error, ...(details ? { details } : {}) });
