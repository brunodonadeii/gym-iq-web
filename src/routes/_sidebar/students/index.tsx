import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const StudentsPage = lazyRouteComponent(
  () => import("@/pages/Students/list/StudentsPage"),
  "StudentsPage",
);

export const Route = createFileRoute("/_sidebar/students/")({
  component: StudentsPage,
  staticData: {
    breadcrumb: "Alunos",
    headline: "Listagem de Alunos",
  },
});
