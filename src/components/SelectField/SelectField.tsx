import { Check, ChevronDown } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type {
  ChangeEvent,
  ChangeEventHandler,
  HTMLAttributes,
  SelectHTMLAttributes,
} from "react";
import { useMemo } from "react";
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
  required,
  disabled,
  name,
  ..._rest
}: SelectFieldProps) => {
  const { className, ...containerRest } = containerProps ?? {};
  const describedBy = error || helperText ? `${id}-helper` : undefined;
  const normalizedValue = String(value ?? "");

  const selectedOption = useMemo(
    () => options.find((option) => option.value === normalizedValue),
    [normalizedValue, options],
  );

  const emitChange = (nextValue: string) => {
    const syntheticEvent = {
      target: {
        value: nextValue,
        name,
        id,
      },
      currentTarget: {
        value: nextValue,
        name,
        id,
      },
    } as ChangeEvent<HTMLSelectElement>;

    onChange(syntheticEvent);
  };

  return (
    <div
      className={[styles.formGroup, className].filter(Boolean).join(" ")}
      {...containerRest}
    >
      <label className={styles.label} htmlFor={id}>
        <span>{label}</span>
        {required && (
          <span className={styles.requiredMeta} aria-hidden="true">
            Obrigatório
          </span>
        )}
      </label>

      <input
        type="hidden"
        id={id}
        name={name}
        value={normalizedValue}
        required={required}
      />

      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger asChild disabled={disabled}>
          <button
            type="button"
            className={[styles.trigger, error && styles.triggerError]
              .filter(Boolean)
              .join(" ")}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            aria-label={label}
            disabled={disabled}
          >
            <span className={styles.triggerText}>
              {selectedOption?.label ?? "Selecione"}
            </span>
            <ChevronDown size={18} className={styles.triggerIcon} />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className={styles.content}
            sideOffset={8}
            align="start"
          >
            {options.map((option) => {
              const selected = option.value === normalizedValue;

              return (
                <DropdownMenu.Item
                  key={`${option.value}-${option.label}`}
                  className={[
                    styles.item,
                    selected && styles.itemSelected,
                    option.disabled && styles.itemDisabled,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={option.disabled}
                  onSelect={() => emitChange(option.value)}
                >
                  <span className={styles.itemLabel}>{option.label}</span>
                  {selected && <Check size={16} className={styles.itemCheck} />}
                </DropdownMenu.Item>
              );
            })}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

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
