import type { InputHTMLAttributes, ReactNode } from "react";

import styles from "./SearchBar.module.css";

type SearchBarProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
};

export const SearchBar = ({ icon, ...rest }: SearchBarProps) => {
  return (
    <div className={styles.container}>
      {icon && <span className={styles.icon}>{icon}</span>}

      <input className={styles.input} type="text" {...rest} />
    </div>
  );
};
