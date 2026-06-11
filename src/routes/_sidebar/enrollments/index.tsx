import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const EnrollmentsPage = lazyRouteComponent(
  () => import("@/pages/Enrollments/list/EnrollmentsPage"),
  "EnrollmentsPage",
);

export const Route = createFileRoute("/_sidebar/enrollments/")({
  component: EnrollmentsPage,
  staticData: {
    breadcrumb: "Matrículas",
    headline: "Listagem de matrículas",
  },
});
