"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/components/app/page-shell";
import EmptyState from "@/components/ui/EmptyState";
import { Inbox } from "lucide-react";

export default function ClientPage({
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
        title="Client Home"
        subtitle="Your workspace for filings and documents"
        actions={<Button className="soft-transition">New Upload</Button>}
        loading={loading}
      >
        <EmptyState
          icon={<Inbox />}
          title="Let’s get started"
          message="You don’t have any uploads yet. Add your first document to kick off your return."
          actionLabel="Upload documents"
          href="/upload"
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Client Home"
      subtitle="Your workspace for filings and documents"
      actions={<Button className="soft-transition">New Upload</Button>}
      loading={loading}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="soft-card">
          <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Recent uploads will appear here.
          </CardContent>
        </Card>
        <Card className="soft-card">
          <CardHeader><CardTitle>Tasks</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Assigned tasks will show up here.
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
