import { EnrollmentsCreate } from "@/pages/Enrollments/create/EnrollmentsCreate";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/enrollments/create")({
  component: EnrollmentsCreate,
  staticData: {
    breadcrumb: "Matrículas / Criar",
    headline: "Crie uma nova matrícula",
  },
});
