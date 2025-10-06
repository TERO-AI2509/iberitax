import { validateModelo100 } from "./validator.js";

const sample = {
  taxYear: 2024,
  taxpayerId: "ES-TEST-123",
  docType: "bank_interest",
  source: { fileName: "sample.pdf", pageCount: 1 },
  currency: "EUR",
  items: [{ type: "interest", amountEUR: 12.34, description: "Bank interest", dateISO: "2024-03-31" }]
};

validateModelo100(sample);
console.log("OK: sample matches Modelo100 contract");
