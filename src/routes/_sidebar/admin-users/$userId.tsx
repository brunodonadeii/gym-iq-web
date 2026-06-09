import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const AdminUsersEdit = lazyRouteComponent(
  () => import("@/pages/AdminUsers/edit/AdminUsersEdit"),
  "AdminUsersEdit",
);

export const Route = createFileRoute("/_sidebar/admin-users/$userId")({
  component: AdminUsersEdit,
  staticData: {
    breadcrumb: "Usuários / Detalhes",
    headline: "Editar usuário administrativo",
  },
});
