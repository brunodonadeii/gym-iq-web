import { getDefaultPathByRole } from "@/utils/auth";
import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute, redirect } from "@tanstack/react-router";

const LoginPage = lazyRouteComponent(
  () => import("@/pages/Login/LoginPage"),
  "LoginPage",
);

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
    reason:
      search.reason === "session-expired" ||
      search.reason === "permissions-changed"
        ? search.reason
        : undefined,
  }),
  component: LoginPage,
});
