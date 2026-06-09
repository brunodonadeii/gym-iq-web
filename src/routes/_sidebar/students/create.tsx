import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const StudentsCreate = lazyRouteComponent(
  () => import("@/pages/Students/create/StudentsCreate"),
  "StudentsCreate",
);

export const Route = createFileRoute("/_sidebar/students/create")({
  component: StudentsCreate,
  staticData: {
    breadcrumb: "Alunos / Criar",
    headline: "Adicionar novo aluno",
  },
});
