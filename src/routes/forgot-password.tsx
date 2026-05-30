import { ForgotPasswordPage } from "@/pages/ForgotPassword/ForgotPasswordPage";
import { getDefaultPathByRole } from "@/utils/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/forgot-password")({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: getDefaultPathByRole(context.auth.role),
      });
    }
  },
  component: ForgotPasswordPage,
});
