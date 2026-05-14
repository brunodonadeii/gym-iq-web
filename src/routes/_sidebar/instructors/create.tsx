import { InstructorsCreate } from "@/pages/Instructors/create/InstructorsCreate";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/instructors/create")({
  component: InstructorsCreate,
  staticData: {
    breadcrumb: "Instrutores / Criar",
    headline: "Adicionar novo instrutor",
  },
});
