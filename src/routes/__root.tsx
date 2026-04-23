import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Suspense } from "react";

export const Route = createRootRoute({
  component: () => (
    <Suspense fallback={<div>Carregando...</div>}>
      <Outlet />
      <TanStackRouterDevtools />
    </Suspense>
  ),
});
