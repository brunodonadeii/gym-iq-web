import { lazyRouteComponent } from "@/utils/lazyRouteComponent";
import { createFileRoute } from "@tanstack/react-router";

const AdminUsersPage = lazyRouteComponent(
  () => import("@/pages/AdminUsers/list/AdminUsersPage"),
  "AdminUsersPage",
);

export const Route = createFileRoute("/_sidebar/admin-users/")({
  component: AdminUsersPage,
  staticData: {
    breadcrumb: "Usuários",
    headline: "Usuários administrativos",
  },
});
