"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Holder for the validator behavior we want per test
let nextValidateFn;
jest.mock("../src/ajv", () => {
    return {
        ajv: {
            compile: () => {
                // Return a callable validator proxy that forwards to nextValidateFn
                const fn = (data) => nextValidateFn(data);
                Object.defineProperty(fn, "errors", {
                    get() { return nextValidateFn.errors; },
                    set(v) { nextValidateFn.errors = v; },
                    configurable: true,
                });
                return fn;
            },
        },
        __esModule: true,
    };
});
const validateExtractResponse_1 = require("../src/validateExtractResponse");
describe("assertValidExtractResponse (unit, mocked Ajv)", () => {
    it("does not throw when payload is valid", () => {
        // Validator returns true and no errors
        nextValidateFn = Object.assign(((data) => true), {
            errors: null,
        });
        expect(() => (0, validateExtractResponse_1.assertValidExtractResponse)({})).not.toThrow();
    });
    it("throws with readable message when payload is invalid", () => {
        // Validator returns false with two Ajv-style errors
        nextValidateFn = Object.assign(((data) => false), {
            errors: [
                // Root-level invalid
                { instancePath: "", keyword: "type", schemaPath: "#/type", params: {}, message: "is invalid" },
                // Nested invalid field
                { instancePath: "/items/0/id", keyword: "type", schemaPath: "#/properties/items/items/properties/id/type", params: {}, message: "must be string" },
            ],
        });
        expect(() => (0, validateExtractResponse_1.assertValidExtractResponse)({ bad: "payload" }))
            .toThrow(/Invalid ExtractResponse: .*\/data .*is invalid.*; .*\/items\/0\/id .*must be string/);
    });
});
