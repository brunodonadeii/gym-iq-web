import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const InstructorsPage = lazyRouteComponent(
  () => import("@/pages/Instructors/list/InstructorsPage"),
  "InstructorsPage",
);

export const Route = createFileRoute("/_sidebar/instructors/")({
  component: InstructorsPage,
  staticData: {
    breadcrumb: "Instrutores",
    headline: "Listagem de Instrutores",
  },
});
