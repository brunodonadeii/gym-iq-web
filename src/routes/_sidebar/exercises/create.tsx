import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const ExercisesCreate = lazyRouteComponent(
  () => import("@/pages/Exercises/create/ExercisesCreate"),
  "ExercisesCreate",
);

export const Route = createFileRoute("/_sidebar/exercises/create")({
  component: ExercisesCreate,
  staticData: {
    breadcrumb: "Exercícios / Criar",
    headline: "Adicionar novo exercício",
  },
});
