import { Header } from "@/components/Header/Header";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { Outlet } from "@tanstack/react-router";
import {
  Activity,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  Dumbbell,
  Layers,
  Users,
} from "lucide-react";
import styles from "./Layout.module.css";

const sidebarItems = [
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
    label: "Matriculas",
    icon: <ClipboardList size={20} />,
    to: "/enrollments",
  },
  {
    label: "Instrutores",
    icon: <Dumbbell size={20} />,
    to: "/instructors",
  },
  {
    label: "Exercicios",
    icon: <Activity size={20} />,
    to: "/exercises",
  },
  {
    label: "Fichas",
    icon: <ClipboardCheck size={20} />,
    to: "/workout-sheets",
  },
  {
    label: "Pagamentos",
    icon: <CreditCard size={20} />,
    to: "/payments",
  },
];

export function Layout() {
  return (
    <div className={styles.shell}>
      <Sidebar items={sidebarItems} />

      <main className={styles.main}>
        <div className={styles.content}>
          <Header />
          <Outlet />
        </div>
      </main>
    </div>
  );
}
