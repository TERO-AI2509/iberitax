"use client";
import { useMemo, useReducer, useState } from "react";
import IncomeSources from "./QuestionnaireSections/IncomeSources";
import FamilyDeductions from "./QuestionnaireSections/FamilyDeductions";
import Housing from "./QuestionnaireSections/Housing";
import Health from "./QuestionnaireSections/Health";
import WorkTransport from "./QuestionnaireSections/WorkTransport";
import CapitalSecurities from "./QuestionnaireSections/CapitalSecurities";
import Crypto from "./QuestionnaireSections/Crypto";

type SectionKey = "income" | "family" | "housing" | "health" | "work" | "capital" | "crypto";
type SectionStatus = "not_started" | "in_progress" | "done" | "pending";

type State = {
  active: SectionKey;
  statuses: Record<SectionKey, SectionStatus>;
  data: {
    income?: any;
    family?: any;
    housing?: any;
  };
  warnings: Partial<Record<SectionKey, string | null>>;
};

type Action =
  | { type: "setActive"; key: SectionKey }
  | { type: "update"; key: SectionKey; data: any }
  | { type: "status"; key: SectionKey; status: SectionStatus }
  | { type: "warning"; key: SectionKey; msg: string | null };

const initial: State = {
  active: "income",
  statuses: {
    income: "not_started",
    family: "not_started",
    housing: "not_started",
    health: "not_started",
    work: "not_started",
    capital: "not_started",
    crypto: "not_started"
  },
  data: {},
  warnings: {}
};

function reducer(state: State, action: Action): State {
  if (action.type === "setActive") return { ...state, active: action.key, statuses: { ...state.statuses, [action.key]: state.statuses[action.key] === "not_started" ? "in_progress" : state.statuses[action.key] } };
  if (action.type === "update") return { ...state, data: { ...state.data, [action.key]: action.data } };
  if (action.type === "status") return { ...state, statuses: { ...state.statuses, [action.key]: action.status } };
  if (action.type === "warning") return { ...state, warnings: { ...state.warnings, [action.key]: action.msg } };
  return state;
}

const sections: { key: SectionKey; title: string; enabled: boolean }[] = [
  { key: "income", title: "Income sources", enabled: true },
  { key: "family", title: "Family & deductions", enabled: true },
  { key: "housing", title: "Housing", enabled: true },
  { key: "health", title: "Health", enabled: false },
  { key: "work", title: "Work expenses & transport", enabled: false },
  { key: "capital", title: "Capital & securities", enabled: false },
  { key: "crypto", title: "Crypto", enabled: false }
];

export default function Questionnaire() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [navOpen, setNavOpen] = useState(true);

  const progress = useMemo(() => {
    const activeCount = sections.filter(s => s.enabled).length;
    const done = Object.entries(state.statuses).filter(([k, v]) => sections.find(s => s.key === k && s.enabled) && v === "done").length;
    const pending = Object.entries(state.statuses).filter(([k, v]) => sections.find(s => s.key === k && s.enabled) && v === "pending").length;
    return { done, pending, total: activeCount };
  }, [state.statuses]);

  const activeSection = useMemo(() => sections.find(s => s.key === state.active)!, [state.active]);

  const SectionBody = () => {
    if (state.active === "income")
      return (
        <IncomeSources
          value={state.data.income || { sources: [] }}
          onChange={v => dispatch({ type: "update", key: "income", data: v })}
          onComplete={() => dispatch({ type: "status", key: "income", status: "done" })}
          onSkip={() => dispatch({ type: "status", key: "income", status: "pending" })}
          setWarning={msg => dispatch({ type: "warning", key: "income", msg })}
        />
      );
    if (state.active === "family")
      return (
        <FamilyDeductions
          value={state.data.family || {}}
          onChange={v => dispatch({ type: "update", key: "family", data: v })}
          onComplete={() => dispatch({ type: "status", key: "family", status: "done" })}
          onSkip={() => dispatch({ type: "status", key: "family", status: "pending" })}
          setWarning={msg => dispatch({ type: "warning", key: "family", msg })}
        />
      );
    if (state.active === "housing")
      return (
        <Housing
          value={state.data.housing || {}}
          onChange={v => dispatch({ type: "update", key: "housing", data: v })}
          onComplete={() => dispatch({ type: "status", key: "housing", status: "done" })}
          onSkip={() => dispatch({ type: "status", key: "housing", status: "pending" })}
          setWarning={msg => dispatch({ type: "warning", key: "housing", msg })}
        />
      );
    if (state.active === "health") return <Health onSkip={() => dispatch({ type: "status", key: "health", status: "pending" })} />;
    if (state.active === "work") return <WorkTransport onSkip={() => dispatch({ type: "status", key: "work", status: "pending" })} />;
    if (state.active === "capital") return <CapitalSecurities onSkip={() => dispatch({ type: "status", key: "capital", status: "pending" })} />;
    if (state.active === "crypto") return <Crypto onSkip={() => dispatch({ type: "status", key: "crypto", status: "pending" })} />;
    return null;
  };

  return (
    <div className="grid lg:grid-cols-[260px,1fr] gap-6">
      <aside className={`rounded-2xl border p-3 h-min ${navOpen ? "" : "hidden lg:block"}`}>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Sections</div>
          <div className="text-xs text-muted-foreground">{progress.done}/{progress.total} done{progress.pending ? ` • ${progress.pending} pending` : ""}</div>
        </div>
        <nav className="mt-3 grid gap-2">
          {sections.map(s => {
            const status = state.statuses[s.key];
            const enabled = s.enabled;
            const isActive = state.active === s.key;
            return (
              <button
                key={s.key}
                type="button"
                disabled={!enabled}
                onClick={() => dispatch({ type: "setActive", key: s.key })}
                className={`w-full rounded-xl px-3 py-2 text-left border transition
                ${isActive ? "border-primary/60 bg-primary/5" : "border-border bg-background"}
                ${enabled ? "hover:bg-muted" : "opacity-50"}
                focus:outline-none`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{s.title}</span>
                  <span className={`text-[11px] ${status === "done" ? "text-emerald-600" : status === "pending" ? "text-amber-600" : "text-muted-foreground"}`}>
                    {status === "done" ? "done" : status === "pending" ? "pending" : status === "in_progress" ? "in progress" : "not started"}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
        <button type="button" onClick={() => setNavOpen(false)} className="mt-3 text-xs text-muted-foreground underline focus:outline-none">Hide</button>
      </aside>

      <main className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold">{activeSection.title}</div>
          {state.warnings[state.active] ? <div className="rounded-xl border border-amber-600/30 bg-amber-500/10 text-amber-700 px-3 py-1 text-xs">{state.warnings[state.active]}</div> : null}
        </div>
        <SectionBody />
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => setNavOpen(true)} className="text-xs text-muted-foreground underline focus:outline-none">Show sections</button>
          <div className="text-xs text-muted-foreground">In-memory only</div>
        </div>
      </main>
    </div>
  );
}
