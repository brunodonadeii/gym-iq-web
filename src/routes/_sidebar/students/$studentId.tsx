import { StudentsEdit } from "@/pages/Students/edit/StudentsEdit";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/students/$studentId")({
  component: StudentsEdit,
  staticData: {
    breadcrumb: "Alunos / Detalhes",
    headline: "Editar aluno",
  },
});
