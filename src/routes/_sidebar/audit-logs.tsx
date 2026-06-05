import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/audit-logs")({
  beforeLoad: ({ context }) => {
    if (!context.auth.hasAnyRole(["ADMIN"])) {
      throw redirect({
        to: "/unauthorized",
      });
    }
  },
  component: () => <Outlet />,
});

