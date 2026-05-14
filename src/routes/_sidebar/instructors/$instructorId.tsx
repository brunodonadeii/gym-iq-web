import { InstructorsEdit } from "@/pages/Instructors/edit/InstructorsEdit";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/instructors/$instructorId")({
  component: InstructorsEdit,
  staticData: {
    breadcrumb: "Instrutores / Detalhes",
    headline: "Editar instrutor",
  },
});
