export type Modelo100ItemType = "interest" | "dividend" | "salary" | "withholding" | "rent";

export interface Modelo100Item {
  type: Modelo100ItemType;
  amountEUR: number;
  description?: string;
  dateISO?: string;
  payer?: string;
}

export interface Modelo100Extract {
  taxYear: number;
  taxpayerId: string;
  docType: "bank_interest" | "dividend" | "nomina" | "withholding" | "rental_income";
  source: { fileName: string; pageCount?: number };
  currency?: "EUR";
  items: Modelo100Item[];
}
