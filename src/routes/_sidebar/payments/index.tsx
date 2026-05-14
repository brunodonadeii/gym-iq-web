import { PaymentsPage } from "@/pages/Payments/list/PaymentsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/payments/")({
  component: PaymentsPage,
  staticData: {
    breadcrumb: "Pagamentos",
    headline: "Listagem de pagamentos",
    description:
      "Acompanhe cobrancas, vencimentos e baixas vinculadas as matriculas.",
  },
});
