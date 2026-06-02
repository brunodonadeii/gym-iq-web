import type { ReactNode } from "react";
import styles from "./ListToolbar.module.css";

type ListToolbarProps = {
  search?: ReactNode;
  filters?: ReactNode;
  action?: ReactNode;
};

export const ListToolbar = ({ search, filters, action }: ListToolbarProps) => {
  return (
    <div className={styles.toolbar}>
      <div className={styles.searchSlot}>{search}</div>
      <div className={styles.controlsSlot}>
        {filters}
        {action}
      </div>
    </div>
  );
};
