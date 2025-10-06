import { validateModelo100 } from "../contracts/validator.js";

export type ContractVerdict = { ok: boolean; reason: string | null };

export function gateModelo100(payload: unknown): ContractVerdict {
  try {
    const ret = (validateModelo100 as any)(payload);
    const ok = typeof ret === "boolean" ? ret : true;
    return { ok, reason: ok ? null : "Contract validation failed" };
  } catch (e: any) {
    return { ok: false, reason: e?.message ?? "Contract validator threw" };
  }
}
