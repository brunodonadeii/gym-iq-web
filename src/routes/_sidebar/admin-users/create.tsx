import { AdminUsersCreate } from "@/pages/AdminUsers/create/AdminUsersCreate";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/admin-users/create")({
  component: AdminUsersCreate,
  staticData: {
    breadcrumb: "Usuários / Criar",
    headline: "Cadastre um usuário administrativo",
  },
});
