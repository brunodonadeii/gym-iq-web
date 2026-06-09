import { getDefaultPathByRole } from "@/utils/auth";
import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute, redirect } from "@tanstack/react-router";

const ForgotPasswordPage = lazyRouteComponent(
  () => import("@/pages/ForgotPassword/ForgotPasswordPage"),
  "ForgotPasswordPage",
);

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
