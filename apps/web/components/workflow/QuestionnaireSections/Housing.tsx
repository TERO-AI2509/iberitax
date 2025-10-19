"use client";
import { useEffect, useMemo, useState } from "react";

type HousingState = {
  tenure?: "rent" | "own" | "";
  monthlyRent?: number;
  monthsRented?: number;
  mortgageInterest?: number;
  ibi?: number;
  monthsOwned?: number;
  movedDuringYear?: boolean;
};

type Props = {
  value: HousingState;
  onChange: (v: HousingState) => void;
  onComplete: () => void;
  onSkip: () => void;
  setWarning: (msg: string | null) => void;
};

export default function Housing({ value, onChange, onComplete, onSkip, setWarning }: Props) {
  const [local, setLocal] = useState<HousingState>(value || { tenure: "" });
  useEffect(() => onChange(local), [local]);
  useEffect(() => {
    const incomeProxy = 12000;
    if (local.tenure === "rent" && (local.monthlyRent || 0) * 12 > incomeProxy * 1.5) setWarning("Rent looks high compared to typical income.");
    else setWarning(null);
  }, [local, setWarning]);
  const canComplete = useMemo(() => !!local.tenure, [local.tenure]);
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setLocal(s => ({ ...s, tenure: "rent" }))}
          className={`rounded-xl border px-4 py-2 ${local.tenure === "rent" ? "border-primary/60 bg-primary/5" : "border-border bg-background"} focus:outline-none`}
        >
          Rent
        </button>
        <button
          type="button"
          onClick={() => setLocal(s => ({ ...s, tenure: "own" }))}
          className={`rounded-xl border px-4 py-2 ${local.tenure === "own" ? "border-primary/60 bg-primary/5" : "border-border bg-background"} focus:outline-none`}
        >
          Own
        </button>
      </div>

      {local.tenure === "rent" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-xs text-muted-foreground">Monthly rent</span>
            <input
              inputMode="decimal"
              className="rounded-xl border px-3 py-2 bg-background"
              value={local.monthlyRent ?? ""}
              onChange={e => setLocal(s => ({ ...s, monthlyRent: Number(e.target.value || 0) }))}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs text-muted-foreground">Months rented</span>
            <input
              inputMode="numeric"
              className="rounded-xl border px-3 py-2 bg-background"
              value={local.monthsRented ?? ""}
              onChange={e => setLocal(s => ({ ...s, monthsRented: Number(e.target.value || 0) }))}
            />
          </label>
        </div>
      )}

      {local.tenure === "own" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="grid gap-1">
            <span className="text-xs text-muted-foreground">Mortgage interest</span>
            <input
              inputMode="decimal"
              className="rounded-xl border px-3 py-2 bg-background"
              value={local.mortgageInterest ?? ""}
              onChange={e => setLocal(s => ({ ...s, mortgageInterest: Number(e.target.value || 0) }))}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs text-muted-foreground">IBI</span>
            <input
              inputMode="decimal"
              className="rounded-xl border px-3 py-2 bg-background"
              value={local.ibi ?? ""}
              onChange={e => setLocal(s => ({ ...s, ibi: Number(e.target.value || 0) }))}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs text-muted-foreground">Months owned</span>
            <input
              inputMode="numeric"
              className="rounded-xl border px-3 py-2 bg-background"
              value={local.monthsOwned ?? ""}
              onChange={e => setLocal(s => ({ ...s, monthsOwned: Number(e.target.value || 0) }))}
            />
          </label>
        </div>
      )}

      <label className="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!!local.movedDuringYear}
          onChange={e => setLocal(s => ({ ...s, movedDuringYear: e.target.checked }))}
        />
        Moved during the year
      </label>

      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onSkip} className="rounded-xl px-4 py-2 border bg-background hover:bg-muted focus:outline-none">Skip for later</button>
        <button type="button" disabled={!canComplete} onClick={onComplete} className="rounded-xl px-4 py-2 border bg-primary text-primary-foreground disabled:opacity-50 focus:outline-none">Save section</button>
      </div>
    </div>
  );
}
