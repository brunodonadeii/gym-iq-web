import { ExercisesCreate } from "@/pages/Exercises/create/ExercisesCreate";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/exercises/create")({
  component: ExercisesCreate,
  staticData: {
    breadcrumb: "Exercicios / Criar",
    headline: "Adicionar novo exercicio",
  },
});
