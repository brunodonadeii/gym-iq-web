import { Layout } from "@/pages/Layout/Layout";
import type { UserRole } from "@/utils/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";

const ADMIN_PANEL_ROLES: UserRole[] = ["ADMIN", "RECEPTION"];

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
