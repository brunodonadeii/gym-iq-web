import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./SearchBar.module.css";

type SearchBarProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
  containerClassName?: string;
};

export const SearchBar = ({
  icon,
  containerClassName,
  ...rest
}: SearchBarProps) => {
  return (
    <div className={[styles.container, containerClassName].filter(Boolean).join(" ")}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <input className={styles.input} type="text" {...rest} />
    </div>
  );
};
