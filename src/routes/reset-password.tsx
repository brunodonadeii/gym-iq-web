import { ResetPasswordPage } from "@/pages/ResetPassword/ResetPasswordPage";
import { getDefaultPathByRole } from "@/utils/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/reset-password")({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: getDefaultPathByRole(context.auth.role),
      });
    }
  },
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) ?? "",
  }),
  component: ResetPasswordPage,
});

