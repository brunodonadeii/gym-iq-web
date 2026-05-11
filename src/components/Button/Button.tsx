import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export const Button = ({ children, type = "button", ...rest }: ButtonProps) => {
  return (
    <button className={styles.button} type={type} {...rest}>
      {children}
    </button>
  );
};
