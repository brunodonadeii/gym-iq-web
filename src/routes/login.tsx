import { LoginPage } from "@/pages/Login/LoginPage";
import { getDefaultPathByRole } from "@/utils/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: getDefaultPathByRole(context.auth.role),
      });
    }
  },
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) ?? "/dashboard",
  }),
  component: LoginPage,
});
