"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
test('mock stays deterministic', async () => {
    const res = await (0, src_1.extractFromUpload)('uploads/demo.pdf', { mode: 'mock' });
    const d = res.data;
    expect(res.ok).toBe(true);
    expect(d?.jobId).toBe('demo-job-001');
    expect(d?.modelo100?.taxYear).toBe(2024);
    expect(d?.totals?.finalTaxDue).toBe(200);
});
