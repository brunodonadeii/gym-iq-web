import { Header } from "@/components/Header/Header";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { auth, type UserRole } from "@/utils/auth";
import { Outlet } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  Dumbbell,
  Layers,
  ShieldPlus,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import styles from "./Layout.module.css";

type SidebarItem = {
  label: string;
  icon: ReactNode;
  to: string;
  roles?: UserRole[];
};

const sidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    icon: <BarChart3 size={20} />,
    to: "/dashboard",
    roles: ["ADMIN"],
  },
  {
    label: "Alunos",
    icon: <Users size={20} />,
    to: "/students",
  },
  {
    label: "Planos",
    icon: <Layers size={20} />,
    to: "/plans",
  },
  {
    label: "Matrículas",
    icon: <ClipboardList size={20} />,
    to: "/enrollments",
  },
  {
    label: "Instrutores",
    icon: <Dumbbell size={20} />,
    to: "/instructors",
  },
  {
    label: "Exercícios",
    icon: <Activity size={20} />,
    to: "/exercises",
    roles: ["ADMIN"],
  },
  {
    label: "Fichas",
    icon: <ClipboardCheck size={20} />,
    to: "/workout-sheets",
    roles: ["ADMIN"],
  },
  {
    label: "Pagamentos",
    icon: <CreditCard size={20} />,
    to: "/payments",
  },
  {
    label: "Usuários",
    icon: <ShieldPlus size={20} />,
    to: "/admin-users",
    roles: ["ADMIN"],
  },
];

export function Layout() {
  const visibleSidebarItems = sidebarItems.filter(
    (item) => !item.roles || auth.hasAnyRole(item.roles),
  );

  return (
    <div className={styles.shell}>
      <Sidebar items={visibleSidebarItems} />

      <main className={styles.main}>
        <div className={styles.content}>
          <Header />
          <Outlet />
        </div>
      </main>
    </div>
  );
}
