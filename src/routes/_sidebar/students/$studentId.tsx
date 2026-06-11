import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const StudentsEdit = lazyRouteComponent(
  () => import("@/pages/Students/edit/StudentsEdit"),
  "StudentsEdit",
);

export const Route = createFileRoute("/_sidebar/students/$studentId")({
  component: StudentsEdit,
  staticData: {
    breadcrumb: "Alunos / Detalhes",
    headline: "Editar aluno",
  },
});
