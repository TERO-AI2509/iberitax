"use client";
import FlowNav from "@/components/flow/FlowNav";
import WizardNav from "@/components/flow/WizardNav";
import DevHere from "@/components/flow/DevHere";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <FlowNav />
      <div>
        {children}
        <WizardNav />
      </div>
      <DevHere />
    </div>
  );
}
