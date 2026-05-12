import { Layout } from "@/pages/Layout/Layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar")({
  component: Layout,
});
