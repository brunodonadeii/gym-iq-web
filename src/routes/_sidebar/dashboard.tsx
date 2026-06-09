import { requireRoles } from "@/routes/guards";
import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const DashboardPage = lazyRouteComponent(
  () => import("@/pages/Dashboard/DashboardPage"),
  "DashboardPage",
);

export const Route = createFileRoute("/_sidebar/dashboard")({
  beforeLoad: ({ context }) => {
    requireRoles(context, ["ADMIN"]);
  },
  component: DashboardPage,
});
