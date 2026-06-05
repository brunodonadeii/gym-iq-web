import { PlansEdit } from "@/pages/Plans/edit/PlansEdit";
import { requireRoles } from "@/routes/guards";
import { createFileRoute } from "@tanstack/react-router";

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


