import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const PlansPage = lazyRouteComponent(
  () => import("@/pages/Plans/list/PlansPage"),
  "PlansPage",
);

export const Route = createFileRoute("/_sidebar/plans/")({
  component: PlansPage,
  staticData: {
    breadcrumb: "Planos",
    headline: "Listagem de Planos",
  },
});
