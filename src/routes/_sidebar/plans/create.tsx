import { PlansCreate } from "@/pages/Plans/create/PlansCreate";
import { requireRoles } from "@/routes/guards";
import { createFileRoute } from "@tanstack/react-router";

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

