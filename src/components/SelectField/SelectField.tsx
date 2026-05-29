import type {
  ChangeEventHandler,
  HTMLAttributes,
  SelectHTMLAttributes,
} from "react";
import styles from "./SelectField.module.css";

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type SelectFieldProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "onChange" | "children"
> & {
  label: string;
  value: string | number | readonly string[] | undefined;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  options: SelectOption[];
  helperText?: string;
  error?: string;
  containerProps?: HTMLAttributes<HTMLDivElement>;
};

export const SelectField = ({
  label,
  value,
  onChange,
  id,
  options,
  helperText,
  error,
  containerProps,
  ...rest
}: SelectFieldProps) => {
  const { className, ...containerRest } = containerProps ?? {};
  const describedBy = error || helperText ? `${id}-helper` : undefined;

  return (
    <div
      className={[styles.formGroup, className].filter(Boolean).join(" ")}
      {...containerRest}
    >
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>

      <div className={styles.selectWrapper}>
        <select
          className={[styles.select, error && styles.selectError]
            .filter(Boolean)
            .join(" ")}
          id={id}
          value={value}
          onChange={onChange}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...rest}
        >
          {options.map((option) => (
            <option
              key={`${option.value}-${option.label}`}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

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
