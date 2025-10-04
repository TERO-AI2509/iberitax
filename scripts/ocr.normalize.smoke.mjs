import { normalizeSpanishText } from "../packages/ocr/dist/index.js";
const sample = "Factura 05/01/2024 total € 1.234,56 pendiente 7-9-24";
const out = normalizeSpanishText(sample);
console.log("in:", sample);
console.log("out:", out);
const ok = out.includes("2024-01-05") && out.includes("EUR 1234.56") && out.includes("2024-09-07");
if(!ok) process.exitCode = 1;
