import { ExercisesEdit } from "@/pages/Exercises/edit/ExercisesEdit";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/exercises/$exerciseId")({
  component: ExercisesEdit,
  staticData: {
    breadcrumb: "Exercícios / Detalhes",
    headline: "Editar exercício",
  },
});
