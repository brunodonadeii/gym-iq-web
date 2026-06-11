import { LoaderCircle } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import styles from "./Button.module.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "icon";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      leftIcon,
      rightIcon,
      loading = false,
      variant = "primary",
      className,
      disabled,
      type = "button",
      ...rest
    },
    ref,
  ) => {
    const classNames = [styles.button, styles[variant], className]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        className={classNames}
        type={type}
        disabled={disabled || loading}
        {...rest}
      >
        {(loading || leftIcon) && (
          <span className={styles.icon}>
            {loading ? (
              <LoaderCircle size={18} className={styles.spinner} />
            ) : (
              leftIcon
            )}
          </span>
        )}

        <span className={styles.content}>{children}</span>

        {rightIcon && !loading && (
          <span className={styles.icon}>{rightIcon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
