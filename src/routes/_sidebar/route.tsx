import { Layout } from "@/pages/Layout/Layout";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar")({
  beforeLoad: async ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: Layout,
});
