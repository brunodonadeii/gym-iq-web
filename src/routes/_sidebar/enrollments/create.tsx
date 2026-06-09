import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const EnrollmentsCreate = lazyRouteComponent(
  () => import("@/pages/Enrollments/create/EnrollmentsCreate"),
  "EnrollmentsCreate",
);

export const Route = createFileRoute("/_sidebar/enrollments/create")({
  component: EnrollmentsCreate,
  staticData: {
    breadcrumb: "Matrículas / Criar",
    headline: "Crie uma nova matrícula",
  },
});
