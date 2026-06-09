import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const UnauthorizedPage = lazyRouteComponent(
  () => import("@/pages/Unauthorized/UnauthorizedPage"),
  "UnauthorizedPage",
);

export const Route = createFileRoute("/unauthorized")({
  component: UnauthorizedPage,
});
