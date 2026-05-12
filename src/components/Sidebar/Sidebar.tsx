import type { ReactNode } from "react";
import styles from "./Sidebar.module.css";
import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";

type SidebarItems = {
  label: string;
  icon: ReactNode;
  to: string;
};

type SidebarProps = {
  items: SidebarItems[];
};

export const Sidebar = ({ items }: SidebarProps) => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>Navegacao</span>
        <ThemeToggle />
      </div>

      <ul className={styles.navigation}>
        {items.map((i) => (
          <li key={i.to}>
            <Link to={i.to} className={styles.link}>
              {i.icon}
              <span>{i.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};
