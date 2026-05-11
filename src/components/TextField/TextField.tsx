import type { ChangeEventHandler, InputHTMLAttributes } from "react";
import styles from "./TextField.module.css";

type TextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> & {
  label: string;
  value: string | number | readonly string[] | undefined;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

export const TextField = ({
  label,
  value,
  onChange,
  id,
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
    </div>
  );
};
