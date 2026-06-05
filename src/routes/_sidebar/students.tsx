import { requireRoles } from "@/routes/guards";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/students")({
  beforeLoad: ({ context }) => {
    requireRoles(context, ["ADMIN", "RECEPTION"]);
  },
  component: () => <Outlet />,
});

