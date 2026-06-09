import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const WorkoutSheetsCreate = lazyRouteComponent(
  () => import("@/pages/WorkoutSheets/create/WorkoutSheetsCreate"),
  "WorkoutSheetsCreate",
);

export const Route = createFileRoute("/_sidebar/workout-sheets/create")({
  component: WorkoutSheetsCreate,
  staticData: {
    breadcrumb: "Fichas de treino / Criar",
    headline: "Adicionar nova ficha",
  },
});
