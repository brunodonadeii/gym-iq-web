import type {
  PaymentFilterMode,
  PaymentStatusFilter,
} from "@/pages/Payments/list/PaymentsPage";
import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const PaymentsPage = lazyRouteComponent(
  () => import("@/pages/Payments/list/PaymentsPage"),
  "PaymentsPage",
);

const paymentFilterModes = new Set<PaymentFilterMode>([
  "all",
  "student",
  "enrollment",
  "overdue",
]);

const paymentStatusFilters = new Set<PaymentStatusFilter>([
  "all",
  "PENDING",
  "PAID",
  "OVERDUE",
  "CANCELED",
]);

export const Route = createFileRoute("/_sidebar/payments/")({
  validateSearch: (search: Record<string, unknown>) => {
    const mode = search.mode;
    const status = search.status;

    return {
      mode:
        typeof mode === "string" &&
        paymentFilterModes.has(mode as PaymentFilterMode)
          ? (mode as PaymentFilterMode)
          : "all",
      status:
        typeof status === "string" &&
        paymentStatusFilters.has(status as PaymentStatusFilter)
          ? (status as PaymentStatusFilter)
          : "all",
      studentId: typeof search.studentId === "string" ? search.studentId : "",
      studentName:
        typeof search.studentName === "string" ? search.studentName : "",
      enrollmentId:
        typeof search.enrollmentId === "string" ? search.enrollmentId : "",
    };
  },
  component: PaymentsPage,
  staticData: {
    breadcrumb: "Pagamentos",
    headline: "Listagem de pagamentos",
  },
});
