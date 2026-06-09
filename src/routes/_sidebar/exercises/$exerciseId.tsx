import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const ExercisesEdit = lazyRouteComponent(
  () => import("@/pages/Exercises/edit/ExercisesEdit"),
  "ExercisesEdit",
);

export const Route = createFileRoute("/_sidebar/exercises/$exerciseId")({
  component: ExercisesEdit,
  staticData: {
    breadcrumb: "Exercícios / Detalhes",
    headline: "Editar exercício",
  },
});
