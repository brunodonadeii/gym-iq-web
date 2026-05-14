import { PaymentsCreate } from "@/pages/Payments/create/PaymentsCreate";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/payments/create")({
  component: PaymentsCreate,
  staticData: {
    breadcrumb: "Pagamentos / Criar",
    headline: "Crie uma nova cobranca",
  },
});
