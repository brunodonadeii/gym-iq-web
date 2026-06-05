import { DashboardPage } from "@/pages/Dashboard/DashboardPage";
import { requireRoles } from "@/routes/guards";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/dashboard")({
  beforeLoad: ({ context }) => {
    requireRoles(context, ["ADMIN"]);
  },
  component: DashboardPage,
});

