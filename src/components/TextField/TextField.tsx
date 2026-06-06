import type {
  ChangeEventHandler,
  HTMLAttributes,
  InputHTMLAttributes,
} from "react";
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
  optional?: boolean;
  containerProps?: HTMLAttributes<HTMLDivElement>;
};

export const TextField = ({
  label,
  value,
  onChange,
  id,
  helperText,
  error,
  optional = false,
  containerProps,
  required,
  ...rest
}: TextFieldProps) => {
  const { className, ...containerRest } = containerProps ?? {};
  const describedBy = error || helperText ? `${id}-helper` : undefined;

  return (
    <div
      className={[styles.formGroup, className].filter(Boolean).join(" ")}
      {...containerRest}
    >
      <label className={styles.label} htmlFor={id}>
        <span>
          {label}
          {required && (
            <span className={styles.requiredMark} aria-hidden="true">
              {" *"}
            </span>
          )}
          {!required && optional && (
            <span className={styles.optionalMeta}> (opcional)</span>
          )}
        </span>
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
        required={required}
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


