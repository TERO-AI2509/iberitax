"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/components/app/page-shell";
import EmptyState from "@/components/ui/EmptyState";
import { Activity } from "lucide-react";

export default function OpsPage({
  searchParams,
}: {
  searchParams?: { view?: string };
}) {
  const view = searchParams?.view;
  const loading = view === "loading";
  const isEmpty = view === "empty";

  if (isEmpty) {
    return (
      <PageShell
        title="Ops Home"
        subtitle="Operational controls and system status"
        actions={<Button className="soft-transition">Run Sync</Button>}
        loading={loading}
      >
        <EmptyState
          icon={<Activity />}
          title="All systems running smoothly"
          message="No active alerts right now. You’ll be notified when something needs attention."
          subtle
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Ops Home"
      subtitle="Operational controls and system status"
      actions={<Button className="soft-transition">Run Sync</Button>}
      loading={loading}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="soft-card">
          <CardHeader><CardTitle>System Status</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            All systems nominal.
          </CardContent>
        </Card>
        <Card className="soft-card">
          <CardHeader><CardTitle>Controls</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Admin controls will appear here.
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
