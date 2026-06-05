import { StudentsCreate } from "@/pages/Students/create/StudentsCreate";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/students/create")({
  component: StudentsCreate,
  staticData: {
    breadcrumb: "Alunos / Criar",
    headline: "Adicionar novo aluno",
  },
});

