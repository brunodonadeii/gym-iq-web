import { StudentsPage } from "@/pages/Students/list/StudentsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/students/")({
  component: StudentsPage,
  staticData: {
    breadcrumb: "Alunos",
    headline: "Listagem de Alunos",
  },
});

