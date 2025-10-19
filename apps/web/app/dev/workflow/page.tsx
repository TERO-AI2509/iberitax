"use client";

import React from "react";
import StepTracker from "@/components/workflow/StepTracker";
import WorkflowBar from "@/components/workflow/WorkflowBar";
import Questionnaire from "@/components/workflow/Questionnaire";

type Stage = "questionnaire" | "documents" | "review" | "submit";

const STAGES: { id: Stage; label: string }[] = [
  { id: "questionnaire", label: "Questionnaire" },
  { id: "documents", label: "Documents" },
  { id: "review", label: "Review" },
  { id: "submit", label: "Submit" },
];

export default function WorkflowPlaygroundPage() {
  const [index, setIndex] = React.useState(0);
  const stage = STAGES[index];

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setIndex((i) => Math.min(i + 1, STAGES.length - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIndex((i) => Math.max(i - 1, 0));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 md:py-8">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Tax Declaration Workflow</h1>
        <span className="text-xs text-muted-foreground">/dev/workflow</span>
      </header>

      <StepTracker steps={STAGES} currentIndex={index} className="mb-4" />

      <section
        className={[
          "rounded-2xl border bg-card text-card-foreground",
          "px-4 py-5 md:px-6 md:py-6",
        ].join(" ")}
        aria-labelledby="stage-title"
      >
        <h2 id="stage-title" className="mb-2 text-xl font-medium">
          {stage.label}
        </h2>

        {stage.id === "questionnaire" && <Questionnaire />}

        {stage.id === "documents" && (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Provide supporting documents or enter totals where documents are not required.</p>
            <ul className="list-disc pl-5">
              <li>If self-employed, upload invoices or enter total revenue.</li>
              <li>If employed, upload payslips or enter total salary.</li>
              <li>Optional fields for rent, deductions, and other evidence.</li>
            </ul>
          </div>
        )}

        {stage.id === "review" && (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Review a consolidated summary of your answers and uploads.</p>
            <p>Future logic: highlight missing items, show AI flags for improbable values, and allow quick edits before submission.</p>
          </div>
        )}

        {stage.id === "submit" && (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Choose how to submit your declaration.</p>
            <ul className="list-disc pl-5">
              <li>Submit via TERO Fiscal as representative.</li>
              <li>Generate an AEAT-ready PDF for manual submission.</li>
            </ul>
            <p>Future logic: signature, confirmation, and receipt.</p>
          </div>
        )}
      </section>

      <div className="mt-4">
        <WorkflowBar
          currentIndex={index}
          maxIndex={STAGES.length - 1}
          onPrev={() => setIndex((i) => Math.max(0, i - 1))}
          onNext={() => setIndex((i) => Math.min(STAGES.length - 1, i + 1))}
          onReset={() => setIndex(0)}
        />
      </div>

      <footer className="mt-6 text-xs text-muted-foreground">
        Tab to the buttons and press Enter or Space to activate. Arrow keys also step through stages. Motion respects reduced-motion.
      </footer>
    </main>
  );
}
