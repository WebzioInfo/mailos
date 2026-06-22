import { FileText } from "lucide-react";

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">View security and access logs.</p>
      </div>
      <div className="border rounded-xl p-12 bg-background flex flex-col items-center justify-center text-center shadow-sm">
        <FileText className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
        <h2 className="text-xl font-semibold">Audit Logs Scaffolded</h2>
      </div>
    </div>
  );
}
