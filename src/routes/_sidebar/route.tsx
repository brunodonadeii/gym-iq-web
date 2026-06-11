import type { UserRole } from "@/utils/auth";
import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute, redirect } from "@tanstack/react-router";

const Layout = lazyRouteComponent(
  () => import("@/pages/Layout/Layout"),
  "Layout",
);

const ADMIN_PANEL_ROLES: UserRole[] = ["ADMIN", "RECEPTION", "INSTRUCTOR"];

export const Route = createFileRoute("/_sidebar")({
  beforeLoad: async ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }

    if (!context.auth.hasAnyRole(ADMIN_PANEL_ROLES)) {
      throw redirect({
        to: "/unauthorized",
      });
    }
  },
  component: Layout,
});
