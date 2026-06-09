import { clearAuthStorage } from "@/utils/auth";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, X } from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
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

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export const Sidebar = ({ items }: SidebarProps) => {
  const navigate = useNavigate();
  const drawerTitleId = useId();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    clearAuthStorage();
    closeDrawer();
    navigate({ to: "/login" });
  };

  useEffect(() => {
    if (!drawerOpen) return undefined;

    const menuButton = menuButtonRef.current;
    const focusTimer = window.setTimeout(() => {
      const firstFocusable =
        drawerRef.current?.querySelector<HTMLElement>(focusableSelector);

      firstFocusable?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      menuButton?.focus();
    };
  }, [drawerOpen]);

  const handleDrawerKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDrawer();
      return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = drawerRef.current
      ? Array.from(
          drawerRef.current.querySelectorAll<HTMLElement>(focusableSelector),
        ).filter(
          (element) =>
            !element.hasAttribute("disabled") &&
            element.getAttribute("aria-hidden") !== "true",
        )
      : [];

    if (focusableElements.length === 0) {
      event.preventDefault();
      drawerRef.current?.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  const renderSidebarContent = (titleId?: string) => (
    <>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel} id={titleId}>
          Navegação
        </span>
        <ThemeToggle />
      </div>

      <ul className={styles.navigation}>
        {items.map((item) => (
          <li key={item.to}>
            <Link to={item.to} className={styles.link} onClick={closeDrawer}>
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
    </>
  );

  return (
    <>
      <div className={styles.mobileTopbar}>
        <button
          ref={menuButtonRef}
          type="button"
          className={styles.menuButton}
          onClick={() => setDrawerOpen(true)}
          aria-controls="mobile-sidebar"
          aria-expanded={drawerOpen}
        >
          <Menu size={18} />
          <span>Menu</span>
        </button>
        <ThemeToggle />
      </div>

      <aside className={styles.sidebar}>{renderSidebarContent()}</aside>

      {drawerOpen && (
        <div className={styles.drawerLayer}>
          <button
            type="button"
            className={styles.drawerOverlay}
            onClick={closeDrawer}
            aria-label="Fechar menu"
          />
          <aside
            ref={drawerRef}
            id="mobile-sidebar"
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby={drawerTitleId}
            tabIndex={-1}
            onKeyDown={handleDrawerKeyDown}
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={closeDrawer}
              aria-label="Fechar menu"
            >
              <X size={18} />
            </button>
            {renderSidebarContent(drawerTitleId)}
          </aside>
        </div>
      )}
    </>
  );
};
