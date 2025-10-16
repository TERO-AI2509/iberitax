import type { ExtractResponse } from "./types";

export function mockExtraction(): ExtractResponse {
  return {
    ok: true,
    data: {
      jobId: "demo-job-001",
      sourceFiles: [{ filename: "demo.pdf", mimeType: "application/pdf", pages: 2 }],
      modelo100: {
        taxYear: 2024,
        taxpayer: { nif: "X1234567Z", fullName: "Demo Taxpayer", residencyStatus: "resident" },
        incomes: [{ category: "employment", gross: 42000, withheld: 6000 }],
        deductions: [{ code: "H01", description: "Home rent deduction", amount: 500 }],
        totals: { taxableBase: 41500, calculatedTax: 6200, finalTaxDue: 200 }
      },
      confidence: { overall: 0.92 }
    },
    errors: []
  };
}
