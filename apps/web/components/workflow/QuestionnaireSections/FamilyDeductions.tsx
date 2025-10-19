"use client";
import { useEffect, useMemo, useState } from "react";

type FamilyState = {
  dependents?: number;
  childcare?: number;
  donations?: number;
  pensionContribs?: number;
  unionDues?: number;
  disabilityPercent?: number;
};

type Props = {
  value: FamilyState;
  onChange: (v: FamilyState) => void;
  onComplete: () => void;
  onSkip: () => void;
  setWarning: (msg: string | null) => void;
};

export default function FamilyDeductions({ value, onChange, onComplete, onSkip, setWarning }: Props) {
  const [local, setLocal] = useState<FamilyState>(value || {});
  useEffect(() => onChange(local), [local]);
  useEffect(() => {
    if ((local.childcare || 0) > 30000) setWarning("Childcare amount looks unusually high.");
    else setWarning(null);
  }, [local, setWarning]);
  const canComplete = useMemo(() => true, []);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="grid gap-1">
          <span className="text-xs text-muted-foreground">Dependents</span>
          <input
            inputMode="numeric"
            className="rounded-xl border px-3 py-2 bg-background"
            value={local.dependents ?? ""}
            onChange={e => setLocal(s => ({ ...s, dependents: Number(e.target.value || 0) }))}
          />
          <span className="text-[11px] text-muted-foreground">Children you support and live with you most of the year</span>
        </label>
        <label className="grid gap-1">
          <span className="text-xs text-muted-foreground">Childcare</span>
          <input
            inputMode="decimal"
            className="rounded-xl border px-3 py-2 bg-background"
            value={local.childcare ?? ""}
            onChange={e => setLocal(s => ({ ...s, childcare: Number(e.target.value || 0) }))}
          />
          <span className="text-[11px] text-muted-foreground">Nursery, after-school, registered carers</span>
        </label>
        <label className="grid gap-1">
          <span className="text-xs text-muted-foreground">Donations</span>
          <input
            inputMode="decimal"
            className="rounded-xl border px-3 py-2 bg-background"
            value={local.donations ?? ""}
            onChange={e => setLocal(s => ({ ...s, donations: Number(e.target.value || 0) }))}
          />
          <span className="text-[11px] text-muted-foreground">To registered charities or foundations</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="grid gap-1">
          <span className="text-xs text-muted-foreground">Pension contributions</span>
          <input
            inputMode="decimal"
            className="rounded-xl border px-3 py-2 bg-background"
            value={local.pensionContribs ?? ""}
            onChange={e => setLocal(s => ({ ...s, pensionContribs: Number(e.target.value || 0) }))}
          />
          <span className="text-[11px] text-muted-foreground">Personal plans, not employer withholding</span>
        </label>
        <label className="grid gap-1">
          <span className="text-xs text-muted-foreground">Union dues</span>
          <input
            inputMode="decimal"
            className="rounded-xl border px-3 py-2 bg-background"
            value={local.unionDues ?? ""}
            onChange={e => setLocal(s => ({ ...s, unionDues: Number(e.target.value || 0) }))}
          />
          <span className="text-[11px] text-muted-foreground">Annual membership fees</span>
        </label>
        <label className="grid gap-1">
          <span className="text-xs text-muted-foreground">Disability percent</span>
          <input
            inputMode="numeric"
            className="rounded-xl border px-3 py-2 bg-background"
            value={local.disabilityPercent ?? ""}
            onChange={e => setLocal(s => ({ ...s, disabilityPercent: Number(e.target.value || 0) }))}
          />
          <span className="text-[11px] text-muted-foreground">Enter 0 if not applicable</span>
        </label>
      </div>

      <details className="rounded-xl border p-3 text-sm">
        <summary className="cursor-pointer">Learn more about deductions</summary>
        <ul className="mt-2 text-xs text-muted-foreground list-disc pl-5 space-y-1">
          <li>Childcare: invoices must show the provider’s tax ID</li>
          <li>Donations: look for a certificate from the charity</li>
          <li>Pension: payments to private plans; employer plans are handled via salary</li>
          <li>Union dues: usually shown on the union’s annual statement</li>
        </ul>
      </details>

      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onSkip} className="rounded-xl px-4 py-2 border bg-background hover:bg-muted focus:outline-none">Skip for later</button>
        <button type="button" onClick={onComplete} className="rounded-xl px-4 py-2 border bg-primary text-primary-foreground focus:outline-none">Save section</button>
      </div>
    </div>
  );
}
