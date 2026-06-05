import { UnauthorizedPage } from "@/pages/Unauthorized/UnauthorizedPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/unauthorized")({
  component: UnauthorizedPage,
});

