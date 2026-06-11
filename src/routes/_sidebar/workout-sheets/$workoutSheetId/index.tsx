import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const WorkoutSheetsDetails = lazyRouteComponent(
  () => import("@/pages/WorkoutSheets/details/WorkoutSheetsDetails"),
  "WorkoutSheetsDetails",
);

export const Route = createFileRoute(
  "/_sidebar/workout-sheets/$workoutSheetId/",
)({
  component: WorkoutSheetsDetails,
  staticData: {
    breadcrumb: "Fichas de treino / Detalhes",
    headline: "Detalhes da ficha",
  },
});
