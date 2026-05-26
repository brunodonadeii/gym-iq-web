import { LoginPage } from "@/pages/Login/LoginPage";
import { getDefaultPathByRole } from "@/utils/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: getDefaultPathByRole(context.auth.role),
      });
    }
  },
  component: () => <LoginPage />,
});
