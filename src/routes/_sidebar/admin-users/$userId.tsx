import { AdminUsersEdit } from "@/pages/AdminUsers/edit/AdminUsersEdit";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/admin-users/$userId")({
  component: AdminUsersEdit,
  staticData: {
    breadcrumb: "Usuários / Detalhes",
    headline: "Editar usuário administrativo",
  },
});
