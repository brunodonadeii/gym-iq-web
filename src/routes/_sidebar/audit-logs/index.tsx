import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const AuditLogsPage = lazyRouteComponent(
  () => import("@/pages/AuditLogs/list/AuditLogsPage"),
  "AuditLogsPage",
);

export const Route = createFileRoute("/_sidebar/audit-logs/")({
  component: AuditLogsPage,
  staticData: {
    breadcrumb: "Logs",
    headline: "Logs de auditoria",
  },
});
