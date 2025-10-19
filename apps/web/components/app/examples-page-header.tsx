"use client";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/page-header";

export default function ExamplePageHeader() {
  return (
    <PageHeader
      title="Dashboard"
      subtitle="Overview for your workspace"
      actions={
        <>
          <Button variant="outline">Secondary</Button>
          <Button>Primary</Button>
        </>
      }
    />
  );
}
