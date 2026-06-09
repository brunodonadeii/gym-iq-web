import { requireRoles } from "@/routes/guards";
import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const PlansEdit = lazyRouteComponent(
  () => import("@/pages/Plans/edit/PlansEdit"),
  "PlansEdit",
);

export const Route = createFileRoute("/_sidebar/plans/$planId")({
  beforeLoad: ({ context }) => {
    requireRoles(context, ["ADMIN"]);
  },
  component: PlansEdit,
  staticData: {
    breadcrumb: "Planos / Editar",
    headline: "Edite informações de um plano",
  },
});
