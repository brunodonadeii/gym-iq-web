import { ExercisesPage } from "@/pages/Exercises/list/ExercisesPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/exercises/")({
  component: ExercisesPage,
  staticData: {
    breadcrumb: "Exercicios",
    headline: "Listagem de exercicios",
  },
});
