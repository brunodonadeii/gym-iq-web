import { requireRoles } from "@/routes/-guards";
import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const InstructorsCreate = lazyRouteComponent(
  () => import("@/pages/Instructors/create/InstructorsCreate"),
  "InstructorsCreate",
);

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
