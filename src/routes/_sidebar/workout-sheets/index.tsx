import { WorkoutSheetsPage } from "@/pages/WorkoutSheets/list/WorkoutSheetsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/workout-sheets/")({
  component: WorkoutSheetsPage,
  staticData: {
    breadcrumb: "Fichas de treino",
    headline: "Listagem de fichas",
  },
});

