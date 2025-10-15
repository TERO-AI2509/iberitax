import type { FromSchema } from "json-schema-to-ts";
import { ExtractResponseSchema } from "./schemas/extract.schema";

export type ExtractResponse = FromSchema<typeof ExtractResponseSchema>;

// Non-nullable "data" slice so it never collapses to never
export type ExtractResult = NonNullable<ExtractResponse["data"]>;

export { ExtractResponseSchema };
