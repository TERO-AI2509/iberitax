import fs from 'node:fs';
import path from 'node:path';
import { assertValidExtractResponse } from '../../src/validateExtractResponse';

const readFixture = (name: string) => {
  const p = path.join(__dirname, '..', 'fixtures', 'extract', name);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
};

describe('Ajv integration: assertValidExtractResponse (real schema)', () => {
  it('accepts a valid payload (does not throw)', () => {
    const valid = readFixture('valid.json');
    expect(() => assertValidExtractResponse(valid)).not.toThrow();
  });

  it('rejects an invalid payload with a readable message', () => {
    const invalid = readFixture('invalid.json');
    try {
      // @ts-expect-error - intentionally untyped "unknown" style input
      assertValidExtractResponse(invalid);
      throw new Error('Expected validation to throw');
    } catch (err) {
      const msg = String((err as any)?.message ?? err);
      expect(msg).toBeTruthy();
      expect(typeof msg).toBe('string');
      // Sanity check that it's not a useless "[object Object]"
      expect(msg).not.toMatch(/^\[object Object\]$/);
    }
  });
});
