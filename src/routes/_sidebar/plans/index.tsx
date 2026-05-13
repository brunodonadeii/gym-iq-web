import { PlansPage } from "@/pages/Plans/list/PlansPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/plans/")({
  component: PlansPage,
  staticData: {
    breadcrumb: "Planos",
    headline: "Listagem de Planos",
  },
});
