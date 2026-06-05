import { AdminUsersPage } from "@/pages/AdminUsers/list/AdminUsersPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sidebar/admin-users/")({
  component: AdminUsersPage,
  staticData: {
    breadcrumb: "Usuários",
    headline: "Usuários administrativos",
  },
});


