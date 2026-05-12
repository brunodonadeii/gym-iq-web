import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

import styles from "./Button.module.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
};

export const Button = ({
  children,
  leftIcon,
  rightIcon,
  loading = false,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) => {
  return (
    <button
      className={styles.button}
      type={type}
      disabled={disabled || loading}
      {...rest}
    >
      <span className={styles.icon}>
        {loading ? (
          <LoaderCircle size={18} className={styles.spinner} />
        ) : (
          leftIcon
        )}
      </span>

      <span className={styles.content}>{children}</span>

      {rightIcon && !loading && (
        <span className={styles.icon}>{rightIcon}</span>
      )}
    </button>
  );
};
