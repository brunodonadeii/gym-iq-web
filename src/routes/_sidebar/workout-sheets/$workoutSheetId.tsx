import { WorkoutSheetsDetails } from "@/pages/WorkoutSheets/details/WorkoutSheetsDetails";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_sidebar/workout-sheets/$workoutSheetId",
)({
  component: WorkoutSheetsDetails,
  staticData: {
    breadcrumb: "Fichas de treino / Detalhes",
    headline: "Detalhes da ficha",
  },
});
