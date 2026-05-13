import { EnrollmentsPage } from "@/pages/Enrollments/list/EnrollmentsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/enrollments/")({
  component: EnrollmentsPage,
  staticData: {
    breadcrumb: "Matriculas",
    headline: "Listagem de matriculas",
    description:
      "Gerencie vinculos entre alunos e planos com foco em vigencia, status e renovacao.",
  },
});
