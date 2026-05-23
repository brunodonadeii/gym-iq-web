import { EnrollmentsPage } from "@/pages/Enrollments/list/EnrollmentsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/enrollments/")({
  component: EnrollmentsPage,
  staticData: {
    breadcrumb: "Matrículas",
    headline: "Listagem de matrículas",
  },
});
