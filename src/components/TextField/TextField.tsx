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
};

export const TextField = ({
  label,
  value,
  onChange,
  id,
  helperText,
  ...rest
}: TextFieldProps) => {
  return (
    <div className={styles.formGroup}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>

      <input
        className={styles.input}
        id={id}
        value={value}
        onChange={onChange}
        {...rest}
      />

      {helperText && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
};
