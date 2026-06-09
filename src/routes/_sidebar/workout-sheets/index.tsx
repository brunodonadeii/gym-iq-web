import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const WorkoutSheetsPage = lazyRouteComponent(
  () => import("@/pages/WorkoutSheets/list/WorkoutSheetsPage"),
  "WorkoutSheetsPage",
);

export const Route = createFileRoute("/_sidebar/workout-sheets/")({
  component: WorkoutSheetsPage,
  staticData: {
    breadcrumb: "Fichas de treino",
    headline: "Listagem de fichas",
  },
});
