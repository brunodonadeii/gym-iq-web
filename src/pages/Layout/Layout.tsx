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
  FileSearch,
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
    roles: ["ADMIN", "RECEPTION"],
  },
  {
    label: "Planos",
    icon: <Layers size={20} />,
    to: "/plans",
    roles: ["ADMIN", "RECEPTION"],
  },
  {
    label: "Matrículas",
    icon: <ClipboardList size={20} />,
    to: "/enrollments",
    roles: ["ADMIN", "RECEPTION"],
  },
  {
    label: "Instrutores",
    icon: <Dumbbell size={20} />,
    to: "/instructors",
    roles: ["ADMIN", "RECEPTION"],
  },
  {
    label: "Exercícios",
    icon: <Activity size={20} />,
    to: "/exercises",
    roles: ["ADMIN", "INSTRUCTOR"],
  },
  {
    label: "Fichas",
    icon: <ClipboardCheck size={20} />,
    to: "/workout-sheets",
    roles: ["ADMIN", "INSTRUCTOR"],
  },
  {
    label: "Pagamentos",
    icon: <CreditCard size={20} />,
    to: "/payments",
    roles: ["ADMIN", "RECEPTION"],
  },
  {
    label: "Usuários",
    icon: <ShieldPlus size={20} />,
    to: "/admin-users",
    roles: ["ADMIN"],
  },
  {
    label: "Logs",
    icon: <FileSearch size={20} />,
    to: "/audit-logs",
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


