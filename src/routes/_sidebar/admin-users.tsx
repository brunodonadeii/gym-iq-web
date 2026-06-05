import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/admin-users")({
  beforeLoad: ({ context }) => {
    if (!context.auth.hasAnyRole(["ADMIN"])) {
      throw redirect({
        to: "/unauthorized",
      });
    }
  },
  component: () => <Outlet />,
});

