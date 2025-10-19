import EmptyState from "@/components/ui/EmptyState";
import { Inbox, Scale, Activity } from "lucide-react";

export default function EmptyStatesPreviewPage() {
  return (
    <div className="page-x page-y section-stack">
      <h1 className="text-2xl font-semibold tracking-tight">Empty States</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <EmptyState icon={<Inbox />} title="Let’s get started" message="Client view" actionLabel="Upload" href="/upload" />
        <EmptyState icon={<Scale />} title="No assigned cases" message="Lawyer view" actionLabel="Refresh" href="/lawyer" subtle />
        <EmptyState icon={<Activity />} title="All systems running smoothly" message="Ops view" subtle />
      </div>
    </div>
  );
}
