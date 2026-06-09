import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const InstructorsEdit = lazyRouteComponent(
  () => import("@/pages/Instructors/edit/InstructorsEdit"),
  "InstructorsEdit",
);

export const Route = createFileRoute("/_sidebar/instructors/$instructorId")({
  component: InstructorsEdit,
  staticData: {
    breadcrumb: "Instrutores / Detalhes",
    headline: "Editar instrutor",
  },
});
