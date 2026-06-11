import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const WorkoutSheetsEdit = lazyRouteComponent(
  () => import("@/pages/WorkoutSheets/edit/WorkoutSheetsEdit"),
  "WorkoutSheetsEdit",
);

export const Route = createFileRoute(
  "/_sidebar/workout-sheets/$workoutSheetId/edit",
)({
  component: WorkoutSheetsEdit,
  staticData: {
    breadcrumb: "Fichas de treino / Editar",
    headline: "Editar ficha",
  },
});
