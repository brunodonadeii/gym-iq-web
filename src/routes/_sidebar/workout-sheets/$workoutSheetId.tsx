import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_sidebar/workout-sheets/$workoutSheetId",
)({
  component: Outlet,
});
