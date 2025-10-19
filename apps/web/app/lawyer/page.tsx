"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/components/app/page-shell";
import EmptyState from "@/components/ui/EmptyState";
import { Scale } from "lucide-react";

export default function LawyerPage({
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
        title="Lawyer Home"
        subtitle="Review, notes, and client documents"
        actions={<Button className="soft-transition">Start Review</Button>}
        loading={loading}
      >
        <EmptyState
          icon={<Scale />}
          title="No assigned cases"
          message="You’ll see client files here as soon as they’re assigned to you."
          actionLabel="Refresh"
          href="/lawyer"
          subtle
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Lawyer Home"
      subtitle="Review, notes, and client documents"
      actions={<Button className="soft-transition">Start Review</Button>}
      loading={loading}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="soft-card">
          <CardHeader><CardTitle>Reviews</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Open reviews will appear here.
          </CardContent>
        </Card>
        <Card className="soft-card">
          <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            You’re up to date.
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
