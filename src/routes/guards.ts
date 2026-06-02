import type { UserRole } from "@/utils/auth";
import { redirect } from "@tanstack/react-router";

type RouteAuthContext = {
  auth: {
    hasAnyRole: (roles: UserRole[]) => boolean;
  };
};

export const requireRoles = (
  context: RouteAuthContext,
  roles: UserRole[],
) => {
  if (!context.auth.hasAnyRole(roles)) {
    throw redirect({
      to: "/unauthorized",
    });
  }
};
