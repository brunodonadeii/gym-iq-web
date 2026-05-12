import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/dashboard")({
  component: () => <div>Hello "/_sidebar/dashboard"!</div>,
});
