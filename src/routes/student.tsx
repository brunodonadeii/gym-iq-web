import { StudentPortalPage } from "@/pages/StudentPortal/StudentPortalPage";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/student")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: "/student",
        },
      });
    }

    if (!context.auth.hasAnyRole(["STUDENT"])) {
      throw redirect({
        to: "/unauthorized",
      });
    }
  },
  component: StudentPortalPage,
});
