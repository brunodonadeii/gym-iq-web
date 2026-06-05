import { InstructorsPage } from "@/pages/Instructors/list/InstructorsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/instructors/")({
  component: InstructorsPage,
  staticData: {
    breadcrumb: "Instrutores",
    headline: "Listagem de Instrutores",
  },
});

