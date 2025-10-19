import { Metadata } from "next";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatStrip } from "@/components/ui/StatStrip";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Theme Preview — KPIs",
};

export default function Page() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">KPI & StatStrip Preview</h1>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Default"
          value="—"
          deltaLabel="No change"
          deltaDirection="neutral"
        />

        <KpiCard
          title="Up this week"
          value="2,481"
          deltaLabel="+12% this week"
          deltaDirection="up"
          icon={<TrendingUp className="h-5 w-5" />}
          interactive
        />

        <KpiCard
          title="Down this week"
          value="318"
          deltaLabel="−8% this week"
          deltaDirection="down"
          icon={<TrendingDown className="h-5 w-5" />}
          interactive
        />

        <KpiCard
          title="Loading"
          loading
          deltaLabel="Loading"
          deltaDirection="neutral"
          icon={<Loader2 className="h-5 w-5 animate-spin" />}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">StatStrip</h2>
        <StatStrip
          ariaLabel="Example statistics"
          items={[
            {
              id: "a",
              label: "Active",
              value: "1,204",
              deltaLabel: "+3.1%",
              deltaDirection: "up",
            },
            {
              id: "b",
              label: "Churn",
              value: "2.4%",
              deltaLabel: "−0.2%",
              deltaDirection: "down",
            },
            {
              id: "c",
              label: "Net",
              value: "€8.3k",
              deltaLabel: "No change",
              deltaDirection: "neutral",
            },
            {
              id: "d",
              label: "Loading",
              loading: true,
              deltaLabel: "Loading",
              deltaDirection: "neutral",
            },
          ]}
        />
      </section>
    </main>
  );
}
