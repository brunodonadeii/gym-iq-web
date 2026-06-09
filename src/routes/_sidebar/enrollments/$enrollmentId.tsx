import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const EnrollmentsRenew = lazyRouteComponent(
  () => import("@/pages/Enrollments/renew/EnrollmentsRenew"),
  "EnrollmentsRenew",
);

export const Route = createFileRoute("/_sidebar/enrollments/$enrollmentId")({
  component: EnrollmentsRenew,
  staticData: {
    breadcrumb: "Matrículas / Renovar",
    headline: "Renove uma matrícula",
  },
});
