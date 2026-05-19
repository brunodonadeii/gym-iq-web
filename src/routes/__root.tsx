import { Skeleton } from "@/components/Skeleton/Skeleton";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Suspense } from "react";

interface RouterContext {
  auth: {
    isAuthenticated: boolean;
    token: string | null;
  };
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <Suspense fallback={<Skeleton height="100vh" radius="0" />}>
      <Outlet />
      <TanStackRouterDevtools />
    </Suspense>
  ),
});
