import { getDefaultPathByRole } from "@/utils/auth";
import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute, redirect } from "@tanstack/react-router";

const LoginPage = lazyRouteComponent(
  () => import("@/pages/Login/LoginPage"),
  "LoginPage",
);

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: getDefaultPathByRole(context.auth.role),
      });
    }
  },
  component: LoginPage,
});
