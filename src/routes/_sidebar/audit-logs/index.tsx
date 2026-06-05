import { AuditLogsPage } from "@/pages/AuditLogs/list/AuditLogsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/audit-logs/")({
  component: AuditLogsPage,
  staticData: {
    breadcrumb: "Logs",
    headline: "Logs de auditoria",
  },
});

