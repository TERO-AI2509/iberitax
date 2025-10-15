import { getAjv } from "./ajv.js";
import { UploadInitRequestSchema, UploadInitResponseSchema } from "../schemas/upload.schema.js";
import type { ApiResult } from "../api/result.js";

export type UploadInitRequest = {
  filename: string;
  contentType: string;
  size?: number;
};

export type UploadInitData = { key: string; putURL: string };
export type UploadInitResponse = import("../api/result.js").ApiResult<UploadInitData>;

const ajv = getAjv();

// Typed guard (cast), so TS stops complaining about <T> generic
export const validateUploadInitRequest =
  ajv.compile(UploadInitRequestSchema) as (v: any) => v is UploadInitRequest;

// Response stays structural
export const validateUploadInitResponse = ajv.compile(UploadInitResponseSchema);
