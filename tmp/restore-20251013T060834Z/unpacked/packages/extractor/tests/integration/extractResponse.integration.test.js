"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const validateExtractResponse_1 = require("../../src/validateExtractResponse");
const readFixture = (name) => {
    const p = node_path_1.default.join(__dirname, '..', 'fixtures', 'extract', name);
    return JSON.parse(node_fs_1.default.readFileSync(p, 'utf8'));
};
describe('Ajv integration: assertValidExtractResponse (real schema)', () => {
    it('accepts a valid payload (does not throw)', () => {
        const valid = readFixture('valid.json');
        expect(() => (0, validateExtractResponse_1.assertValidExtractResponse)(valid)).not.toThrow();
    });
    it('rejects an invalid payload with a readable message', () => {
        const invalid = readFixture('invalid.json');
        try {
            // @ts-expect-error - intentionally untyped "unknown" style input
            (0, validateExtractResponse_1.assertValidExtractResponse)(invalid);
            throw new Error('Expected validation to throw');
        }
        catch (err) {
            const msg = String(err?.message ?? err);
            expect(msg).toBeTruthy();
            expect(typeof msg).toBe('string');
            // Sanity check that it's not a useless "[object Object]"
            expect(msg).not.toMatch(/^\[object Object\]$/);
        }
    });
});
