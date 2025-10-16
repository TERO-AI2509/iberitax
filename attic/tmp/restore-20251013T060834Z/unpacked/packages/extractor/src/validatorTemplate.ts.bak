import type { ErrorObject } from "ajv";
import AjvCtor from "ajv";
import addFormats from "ajv-formats";
import type { JSONSchema7 } from "json-schema";

/**
 * Factory for creating a lazy Ajv validator with readable errors.
 */
export function makeValidator<T>(schema: JSONSchema7) {
  let compiled: any | null = null;

  function getAjv() {
    const ajv = new AjvCtor({ allErrors: true, strict: false });
    addFormats(ajv);
    return ajv;
  }

  function getCompiled() {
    if (!compiled) {
      compiled = getAjv().compile<T>(schema);
    }
    return compiled;
  }

  const validate = ((data: unknown) => {
    const v = getCompiled();
    const ok = v(data);
    (validate as any).errors = v.errors;
    return ok;
  }) as ((d: unknown) => boolean) & { errors?: ErrorObject[] | null };

  (validate as any).errors = null;
  return validate;
}
