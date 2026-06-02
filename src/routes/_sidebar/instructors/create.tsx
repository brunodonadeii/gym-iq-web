import { InstructorsCreate } from "@/pages/Instructors/create/InstructorsCreate";
import { requireRoles } from "@/routes/guards";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/instructors/create")({
  beforeLoad: ({ context }) => {
    requireRoles(context, ["ADMIN"]);
  },
  component: InstructorsCreate,
  staticData: {
    breadcrumb: "Instrutores / Criar",
    headline: "Adicionar novo instrutor",
  },
});
