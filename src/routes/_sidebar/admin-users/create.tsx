import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute, redirect } from "@tanstack/react-router";

const AdminUsersCreate = lazyRouteComponent(
  () => import("@/pages/AdminUsers/create/AdminUsersCreate"),
  "AdminUsersCreate",
);

export const Route = createFileRoute("/_sidebar/admin-users/create")({
  beforeLoad: ({ context }) => {
    if (!context.auth.hasAnyRole(["ADMIN"])) {
      throw redirect({
        to: "/unauthorized",
      });
    }
  },
  component: AdminUsersCreate,
  staticData: {
    breadcrumb: "Usuários / Criar",
    headline: "Cadastre um usuário administrativo",
  },
});
