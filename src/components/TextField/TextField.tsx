import type { ChangeEventHandler, InputHTMLAttributes } from "react";
import styles from "./TextField.module.css";

type TextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> & {
  label: string;
  value: string | number | readonly string[] | undefined;
  onChange: ChangeEventHandler<HTMLInputElement>;
  helperText?: string;
  error?: string;
};

export const TextField = ({
  label,
  value,
  onChange,
  id,
  helperText,
  error,
  ...rest
}: TextFieldProps) => {
  const describedBy = error || helperText ? `${id}-helper` : undefined;

  return (
    <div className={styles.formGroup}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>

      <input
        className={[styles.input, error && styles.inputError]
          .filter(Boolean)
          .join(" ")}
        id={id}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        {...rest}
      />

      {(error || helperText) && (
        <span
          className={error ? styles.errorText : styles.helperText}
          id={describedBy}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
};
