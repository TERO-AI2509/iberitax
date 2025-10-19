"use client";
import { useEffect, useMemo, useState } from "react";

type IncomeState = {
  sources: string[];
  employed?: { grossAnnual?: number; monthsWorked?: number };
  selfEmployed?: { turnover?: number; expenses?: number; wantsSpreadsheet?: boolean };
  rental?: { annualRentIncome?: number; expenses?: number };
  capital?: { gains?: number; dividends?: number; interest?: number };
  otherNote?: string;
};

type Props = {
  value: IncomeState;
  onChange: (v: IncomeState) => void;
  onComplete: () => void;
  onSkip: () => void;
  setWarning: (msg: string | null) => void;
};

const allSources = [
  { key: "employed", label: "Employed", why: "We use your annual certificate." },
  { key: "selfEmployed", label: "Self-employed", why: "Side gigs and freelancers." },
  { key: "unemployment", label: "Unemployment benefits", why: "SEPE or similar payments." },
  { key: "pension", label: "Pension", why: "State or private pensions." },
  { key: "rental", label: "Rental income", why: "Totals across properties." },
  { key: "capital", label: "Capital income", why: "Gains, dividends, and interest." },
  { key: "other", label: "Other", why: "Anything not listed above." }
];

export default function IncomeSources({ value, onChange, onComplete, onSkip, setWarning }: Props) {
  const [local, setLocal] = useState<IncomeState>(value || { sources: [] });
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => onChange(local), [local]);

  useEffect(() => {
    if (!current && local.sources.length > 0) setCurrent(local.sources[0]);
  }, [local.sources, current]);

  const ensureSelectedAndFocus = (k: string) => {
    setLocal(s => (s.sources.includes(k) ? s : { ...s, sources: [...s.sources, k] }));
    setCurrent(k);
  };

  const removeSource = (k: string) => {
    setLocal(s => {
      const sources = s.sources.filter(x => x !== k);
      const next = { ...s, sources };
      if (!sources.includes("employed")) next.employed = undefined;
      if (!sources.includes("selfEmployed")) next.selfEmployed = undefined;
      if (!sources.includes("rental")) next.rental = undefined;
      if (!sources.includes("capital")) next.capital = undefined;
      return next;
    });
    setCurrent(prev => (prev === k ? null : prev));
  };

  useEffect(() => {
    const employed = local.employed?.grossAnnual || 0;
    const rent = local.rental?.annualRentIncome || 0;
    const capital = (local.capital?.gains || 0) + (local.capital?.dividends || 0) + (local.capital?.interest || 0);
    const turnover = local.selfEmployed?.turnover || 0;
    const totalIncome = employed + rent + capital + turnover;
    const expensesSE = local.selfEmployed?.expenses || 0;
    if (totalIncome > 0 && expensesSE > totalIncome * 0.9) setWarning("Self-employed expenses look unusually high.");
    else setWarning(null);
  }, [local, setWarning]);

  const completedFor = (k: string) => {
    if (k === "employed") return !!local.employed?.grossAnnual;
    if (k === "selfEmployed") return !!local.selfEmployed?.turnover;
    if (k === "rental") return !!local.rental?.annualRentIncome;
    if (k === "capital") return !!local.capital && ((local.capital.gains || 0) + (local.capital.dividends || 0) + (local.capital.interest || 0)) > 0;
    if (k === "other") return !!local.otherNote;
    if (k === "unemployment" || k === "pension") return local.sources.includes(k);
    return false;
  };

  const canComplete = useMemo(() => local.sources.length > 0, [local.sources.length]);

  const downloadCSV = () => {
    const rows = [
      ["date","description","category","amount"],
      ["2025-01-05","Website hosting","services","-12.00"],
      ["2025-01-15","Client invoice #001","income","450.00"]
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bookkeeping-template.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const Detail = () => {
    if (!current) return <div className="text-sm text-muted-foreground">Select a source to enter details</div>;
    if (current === "employed")
      return (
        <div className="space-y-3">
          <div className="text-sm font-medium">Employment details</div>
          <p className="text-xs text-muted-foreground">Use the amounts on your annual certificate or last payslip of the year.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-xs text-muted-foreground">Gross annual salary</span>
              <input inputMode="decimal" className="rounded-xl border px-3 py-2 bg-background" value={local.employed?.grossAnnual ?? ""} onChange={e => setLocal(s => ({ ...s, employed: { ...(s.employed || {}), grossAnnual: Number(e.target.value || 0) } }))} />
              <span className="text-[11px] text-muted-foreground">Example: 32500</span>
            </label>
            <label className="grid gap-1">
              <span className="text-xs text-muted-foreground">Months worked</span>
              <input inputMode="numeric" className="rounded-xl border px-3 py-2 bg-background" value={local.employed?.monthsWorked ?? ""} onChange={e => setLocal(s => ({ ...s, employed: { ...(s.employed || {}), monthsWorked: Number(e.target.value || 0) } }))} />
              <span className="text-[11px] text-muted-foreground">Usually 12; use 6 if mid-year start</span>
            </label>
          </div>
          <details className="rounded-xl border p-3 text-sm">
            <summary className="cursor-pointer">Learn more</summary>
            <div className="mt-2 text-xs text-muted-foreground">Gross salary before tax. If you had two employers, enter the combined total.</div>
          </details>
        </div>
      );
    if (current === "selfEmployed")
      return (
        <div className="space-y-3">
          <div className="text-sm font-medium">Self-employed</div>
          <p className="text-xs text-muted-foreground">Totals for the year. If unsure, estimate and we will review later.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-xs text-muted-foreground">Turnover</span>
              <input inputMode="decimal" className="rounded-xl border px-3 py-2 bg-background" value={local.selfEmployed?.turnover ?? ""} onChange={e => setLocal(s => ({ ...s, selfEmployed: { ...(s.selfEmployed || {}), turnover: Number(e.target.value || 0) } }))} />
              <span className="text-[11px] text-muted-foreground">Sum of invoices including VAT if applicable</span>
            </label>
            <label className="grid gap-1">
              <span className="text-xs text-muted-foreground">Expenses total</span>
              <input inputMode="decimal" className="rounded-xl border px-3 py-2 bg-background" value={local.selfEmployed?.expenses ?? ""} onChange={e => setLocal(s => ({ ...s, selfEmployed: { ...(s.selfEmployed || {}), expenses: Number(e.target.value || 0) } }))} />
              <span className="text-[11px] text-muted-foreground">Materials, tools, phone, internet, travel, fees</span>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!local.selfEmployed?.wantsSpreadsheet} onChange={e => setLocal(s => ({ ...s, selfEmployed: { ...(s.selfEmployed || {}), wantsSpreadsheet: e.target.checked } }))} />
              I prefer a simple bookkeeping spreadsheet
            </label>
            <button type="button" onClick={downloadCSV} className="rounded-lg border px-3 py-1 text-xs focus:outline-none">Download CSV</button>
          </div>
          <details className="rounded-xl border p-3 text-sm">
            <summary className="cursor-pointer">What counts as an expense?</summary>
            <div className="mt-2 text-xs text-muted-foreground">Direct business costs and a fair share of mixed costs. Keep receipts; we may ask later.</div>
          </details>
        </div>
      );
    if (current === "rental")
      return (
        <div className="space-y-3">
          <div className="text-sm font-medium">Rental income</div>
          <p className="text-xs text-muted-foreground">Totals for all rented properties.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-xs text-muted-foreground">Annual rent received</span>
              <input inputMode="decimal" className="rounded-xl border px-3 py-2 bg-background" value={local.rental?.annualRentIncome ?? ""} onChange={e => setLocal(s => ({ ...s, rental: { ...(s.rental || {}), annualRentIncome: Number(e.target.value || 0) } }))} />
              <span className="text-[11px] text-muted-foreground">Total rent paid by tenants</span>
            </label>
            <label className="grid gap-1">
              <span className="text-xs text-muted-foreground">Expenses</span>
              <input inputMode="decimal" className="rounded-xl border px-3 py-2 bg-background" value={local.rental?.expenses ?? ""} onChange={e => setLocal(s => ({ ...s, rental: { ...(s.rental || {}), expenses: Number(e.target.value || 0) } }))} />
              <span className="text:[11px] text-muted-foreground">Repairs, community fees, insurance</span>
            </label>
          </div>
        </div>
      );
    if (current === "capital")
      return (
        <div className="space-y-3">
          <div className="text-sm font-medium">Capital income</div>
          <p className="text-xs text-muted-foreground">Totals from brokers and banks.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="grid gap-1">
              <span className="text-xs text-muted-foreground">Gains</span>
              <input inputMode="decimal" className="rounded-xl border px-3 py-2 bg-background" value={local.capital?.gains ?? ""} onChange={e => setLocal(s => ({ ...s, capital: { ...(s.capital || {}), gains: Number(e.target.value || 0) } }))} />
            </label>
            <label className="grid gap-1">
              <span className="text-xs text-muted-foreground">Dividends</span>
              <input inputMode="decimal" className="rounded-xl border px-3 py-2 bg-background" value={local.capital?.dividends ?? ""} onChange={e => setLocal(s => ({ ...s, capital: { ...(s.capital || {}), dividends: Number(e.target.value || 0) } }))} />
            </label>
            <label className="grid gap-1">
              <span className="text-xs text-muted-foreground">Interest</span>
              <input inputMode="decimal" className="rounded-xl border px-3 py-2 bg-background" value={local.capital?.interest ?? ""} onChange={e => setLocal(s => ({ ...s, capital: { ...(s.capital || {}), interest: Number(e.target.value || 0) } }))} />
            </label>
          </div>
          <details className="rounded-xl border p-3 text-sm">
            <summary className="cursor-pointer">Where to find these?</summary>
            <div className="mt-2 text-xs text-muted-foreground">Your broker’s annual tax report usually lists them.</div>
          </details>
        </div>
      );
    if (current === "other")
      return (
        <div className="space-y-3">
          <div className="text-sm font-medium">Other income</div>
          <label className="grid gap-1">
            <span className="text-xs text-muted-foreground">Describe the income</span>
            <textarea className="rounded-xl border px-3 py-2 bg-background" value={local.otherNote || ""} onChange={e => setLocal(s => ({ ...s, otherNote: e.target.value }))} />
          </label>
        </div>
      );
    return <div className="text-sm text-muted-foreground">No details needed</div>;
  };

  return (
    <div className="grid lg:grid-cols-[340px,1fr] gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Select your income sources</div>
          <div className="text-[11px] text-muted-foreground">{local.sources.filter(s => completedFor(s)).length}/{local.sources.length || 0} complete</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allSources.map(s => {
            const active = local.sources.includes(s.key);
            const done = completedFor(s.key);
            return (
              <div key={s.key} className={`rounded-2xl border ${active ? "border-primary/60 bg-primary/5" : "border-border bg-background"}`}>
                <button type="button" onClick={() => ensureSelectedAndFocus(s.key)} className="w-full text-left px-4 py-3 rounded-2xl hover:bg-muted focus:outline-none" title={s.why}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{s.label}</span>
                    <span className={`text-[11px] ${active ? (done ? "text-emerald-600" : "text-muted-foreground") : "text-muted-foreground"}`}>{active ? (done ? "complete" : "selected") : "select"}</span>
                  </div>
                </button>
                {active ? (
                  <div className="flex items-center justify-between px-4 pb-3">
                    <button type="button" onClick={() => setCurrent(s.key)} className="text-[11px] underline focus:outline-none">Edit details</button>
                    <button type="button" onClick={() => removeSource(s.key)} className="text-[11px] underline text-muted-foreground focus:outline-none">Remove</button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={onSkip} className="rounded-xl px-4 py-2 border bg-background hover:bg-muted focus:outline-none">Skip for later</button>
          <button type="button" disabled={!canComplete} onClick={onComplete} className="rounded-xl px-4 py-2 border bg-primary text-primary-foreground disabled:opacity-50 focus:outline-none">Save section</button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="text-sm font-medium">{current ? `Details: ${allSources.find(x => x.key === current)?.label}` : "Details"}</div>
        <Detail />
      </div>
    </div>
  );
}
