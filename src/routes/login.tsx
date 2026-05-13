import { LoginPage } from "@/pages/Login/LoginPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) ?? "/dashboard",
  }),
  component: LoginPage,
});
