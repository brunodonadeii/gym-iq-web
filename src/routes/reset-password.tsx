import { getDefaultPathByRole } from "@/utils/auth";
import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute, redirect } from "@tanstack/react-router";

const ResetPasswordPage = lazyRouteComponent(
  () => import("@/pages/ResetPassword/ResetPasswordPage"),
  "ResetPasswordPage",
);

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
