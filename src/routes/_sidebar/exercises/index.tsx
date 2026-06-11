import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const ExercisesPage = lazyRouteComponent(
  () => import("@/pages/Exercises/list/ExercisesPage"),
  "ExercisesPage",
);

export const Route = createFileRoute("/_sidebar/exercises/")({
  component: ExercisesPage,
  staticData: {
    breadcrumb: "Exercícios",
    headline: "Listagem de exercícios",
  },
});
