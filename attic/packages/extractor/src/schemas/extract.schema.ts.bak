// packages/extractor/src/schemas/extract.schema.ts
/**
 * JSON Schema — single source of truth for /extract response
 */
export const ExtractResponseSchema = {
  $id: "https://iberitax.local/schemas/extract.response.json",
  type: "object",
  additionalProperties: false,
  properties: {
    ok: { type: "boolean" },
    data: {
      type: "object",
      description: "Extractor result payload",
      additionalProperties: true,
      properties: {
        jobId: { type: "string" },
        fileKey: { type: "string" },
        pages: { type: "integer", minimum: 0 },
        sourceFiles: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              filename: { type: "string" },
              mimeType: { type: "string" },
              pages: { type: "integer", minimum: 0 }
            },
            required: ["filename"]
          }
        },
        modelo100: {
          type: "object",
          additionalProperties: true,
          properties: {
            taxYear: { type: "integer" },
            taxpayer: {
              type: "object",
              additionalProperties: true,
              properties: {
                nif: { type: "string" },
                fullName: { type: "string" },
                residencyStatus: { type: "string" }
              }
            },
            incomes: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: true,
                properties: {
                  category: { type: "string" },
                  gross: { type: "number" },
                  withheld: { type: "number" }
                }
              }
            },
            deductions: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: true,
                properties: {
                  code: { type: "string" },
                  description: { type: "string" },
                  amount: { type: "number" }
                }
              }
            },
            totals: {
              type: "object",
              additionalProperties: true,
              properties: {
                taxableBase: { type: "number" },
                calculatedTax: { type: "number" },
                finalTaxDue: { type: "number" }
              }
            }
          }
        },
        summary: { type: "string" },
        confidence: {
          type: "object",
          additionalProperties: true,
          properties: {
            overall: { type: "number", minimum: 0, maximum: 1 }
          }
        }
      },
      required: []
    },
    errors: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          code: { type: "string" },
          message: { type: "string" },
          path: { type: "string" }
        },
        required: ["code", "message"]
      }
    }
  },
  required: ["ok"]
} as const;

export type _SchemaTag = typeof ExtractResponseSchema;
