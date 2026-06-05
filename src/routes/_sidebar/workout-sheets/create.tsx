import { WorkoutSheetsCreate } from "@/pages/WorkoutSheets/create/WorkoutSheetsCreate";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/workout-sheets/create")({
  component: WorkoutSheetsCreate,
  staticData: {
    breadcrumb: "Fichas de treino / Criar",
    headline: "Adicionar nova ficha",
  },
});

