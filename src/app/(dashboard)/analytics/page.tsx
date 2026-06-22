import { BarChart } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">View detailed reports on campaign performance.</p>
      </div>
      <div className="border rounded-xl p-12 bg-background flex flex-col items-center justify-center text-center shadow-sm">
        <BarChart className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
        <h2 className="text-xl font-semibold">Analytics Scaffolded</h2>
      </div>
    </div>
  );
}
