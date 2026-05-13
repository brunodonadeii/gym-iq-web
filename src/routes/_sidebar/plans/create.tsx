import { PlansCreate } from "@/pages/Plans/create/PlansCreate";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/plans/create")({
  component: PlansCreate,
  staticData: {
    breadcrumb: "Planos / Criar",
    headline: "Crie um novo plano",
  },
});
