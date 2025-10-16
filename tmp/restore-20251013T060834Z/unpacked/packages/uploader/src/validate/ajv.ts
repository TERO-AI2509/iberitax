import AjvCtor from "ajv";
import addFormatsCtor from "ajv-formats";
import { UploadInitRequestSchema, UploadInitResponseSchema } from "../schemas/upload.schema.js";

// Loosen types to avoid NodeNext construct/call signature issues
const Ajv: any = AjvCtor as any;
const addFormats: any = addFormatsCtor as any;

let _ajv: any = null;

export const getAjv = () => {
  if (_ajv) return _ajv;
  const ajv = new Ajv({ allErrors: true, strict: true });
  addFormats(ajv);
  ajv.addSchema(UploadInitRequestSchema);
  ajv.addSchema(UploadInitResponseSchema);
  _ajv = ajv;
  return _ajv;
};

