import type { Schema } from "ajv";

export const UploadInitRequestSchema: Schema = {
  $id: "com.iberitax.uploader.UploadInitRequest",
  type: "object",
  additionalProperties: false,
  required: ["filename", "contentType"],
  properties: {
    filename: { type: "string", minLength: 1, maxLength: 255 },
    contentType: { type: "string", minLength: 3, maxLength: 100 },
    size: { type: "integer", minimum: 0, maximum: 26214400 } // 25 MB cap
  }
} as const;

const KEY_RE = "^uploads/\\d{4}/\\d{2}/\\d{2}/[A-Za-z0-9-]{8,}\\.[A-Za-z0-9]{1,8}$";
const PUT_RE = "^/upload/\\d{4}/\\d{2}/\\d{2}/[A-Za-z0-9-]{8,}\\.[A-Za-z0-9]{1,8}$";

const Success: Schema = {
  type: "object",
  additionalProperties: false,
  required: ["ok", "data"],
  properties: {
    ok: { const: true },
    data: {
      type: "object",
      additionalProperties: false,
      required: ["key", "putURL"],
      properties: {
        key: { type: "string", pattern: KEY_RE },
        putURL: { type: "string", pattern: PUT_RE }
      }
    }
  }
};

const ErrorShape: Schema = {
  type: "object",
  additionalProperties: false,
  required: ["ok", "code", "error"],
  properties: {
    ok: { const: false },
    code: {
      type: "string",
      enum: [
        "BadRequest",
        "ValidationError",
        "ContentTypeNotAllowed",
        "FileTooLarge",
        "StorageError",
        "InternalError"
      ]
    },
    error: { type: "string", minLength: 1 },
    details: {}
  }
};

export const UploadInitResponseSchema: Schema = {
  $id: "com.iberitax.uploader.UploadInitResponse",
  oneOf: [Success, ErrorShape]
} as const;
