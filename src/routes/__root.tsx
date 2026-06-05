import { Skeleton } from "@/components/Skeleton/Skeleton";
import {
  GlobalErrorFallback,
  GlobalNotFoundFallback,
} from "@/pages/RouteFallback/RouteFallback";
import type { UserRole } from "@/utils/auth";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const RouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-router-devtools").then((module) => ({
        default: module.TanStackRouterDevtools,
      })),
    )
  : null;

interface RouterContext {
  auth: {
    isAuthenticated: boolean;
    token: string | null;
    role: UserRole | null;
    hasAnyRole: (roles: UserRole[]) => boolean;
  };
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <Suspense fallback={<Skeleton height="100vh" radius="0" />}>
      <Outlet />
      {RouterDevtools && <RouterDevtools />}
    </Suspense>
  ),
  errorComponent: GlobalErrorFallback,
  notFoundComponent: GlobalNotFoundFallback,
});

