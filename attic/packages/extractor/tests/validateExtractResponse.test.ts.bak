/**
 * Unit test: we mock ./ajv so we can control the compiled validator's behavior
 * without depending on the real JSON Schema or the integration path.
 */
import type { ErrorObject } from "ajv";

// Holder for the validator behavior we want per test
let nextValidateFn: ((data: unknown) => boolean) & { errors: ErrorObject[] | null };

jest.mock("../src/ajv", () => {
  return {
    ajv: {
      compile: () => {
        // Return a callable validator proxy that forwards to nextValidateFn
        const fn: any = (data: unknown) => nextValidateFn(data);
        Object.defineProperty(fn, "errors", {
          get() { return nextValidateFn.errors; },
          set(v) { (nextValidateFn as any).errors = v; },
          configurable: true,
        });
        return fn;
      },
    },
    __esModule: true,
  };
});

import { assertValidExtractResponse } from "../src/validateExtractResponse";

describe("assertValidExtractResponse (unit, mocked Ajv)", () => {
  it("does not throw when payload is valid", () => {
    // Validator returns true and no errors
    nextValidateFn = Object.assign(((data: unknown) => true) as any, {
      errors: null as ErrorObject[] | null,
    });

    expect(() => assertValidExtractResponse({} as any)).not.toThrow();
  });

  it("throws with readable message when payload is invalid", () => {
    // Validator returns false with two Ajv-style errors
    nextValidateFn = Object.assign(((data: unknown) => false) as any, {
      errors: [
        // Root-level invalid
        { instancePath: "", keyword: "type", schemaPath: "#/type", params: {}, message: "is invalid" } as any,
        // Nested invalid field
        { instancePath: "/items/0/id", keyword: "type", schemaPath: "#/properties/items/items/properties/id/type", params: {}, message: "must be string" } as any,
      ] as ErrorObject[],
    });

    expect(() => assertValidExtractResponse({ bad: "payload" } as any))
      .toThrow(/Invalid ExtractResponse: .*\/data .*is invalid.*; .*\/items\/0\/id .*must be string/);
  });
});
