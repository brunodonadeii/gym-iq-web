import { clearAuthStorage } from "@/utils/auth";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import styles from "./Sidebar.module.css";

type SidebarItems = {
  label: string;
  icon: ReactNode;
  to: string;
};

type SidebarProps = {
  items: SidebarItems[];
};

export const Sidebar = ({ items }: SidebarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthStorage();
    navigate({ to: "/login" });
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>Navegação</span>
        <ThemeToggle />
      </div>

      <ul className={styles.navigation}>
        {items.map((item) => (
          <li key={item.to}>
            <Link to={item.to} className={styles.link}>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className={styles.sidebarFooter}>
        <button
          type="button"
          className={styles.logoutButton}
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};


