import { EnrollmentsRenew } from "@/pages/Enrollments/renew/EnrollmentsRenew";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/enrollments/$enrollmentId")({
  component: EnrollmentsRenew,
  staticData: {
    breadcrumb: "Matriculas / Renovar",
    headline: "Renove uma matricula",
  },
});
