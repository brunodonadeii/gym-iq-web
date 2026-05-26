import { AdminUsersCreate } from "@/pages/AdminUsers/create/AdminUsersCreate";
import { createFileRoute, redirect } from "@tanstack/react-router";

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
