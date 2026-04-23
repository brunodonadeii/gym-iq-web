import StudentsPage from "@/pages/StudentsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/dashboard/students/")({
  component: StudentsPage,
});
