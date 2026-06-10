import { requireRoles } from "@/routes/-guards";
import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const PlansCreate = lazyRouteComponent(
  () => import("@/pages/Plans/create/PlansCreate"),
  "PlansCreate",
);

export const Route = createFileRoute("/_sidebar/plans/create")({
  beforeLoad: ({ context }) => {
    requireRoles(context, ["ADMIN"]);
  },
  component: PlansCreate,
  staticData: {
    breadcrumb: "Planos / Criar",
    headline: "Crie um novo plano",
  },
});
