import { Skeleton } from "@/components/Skeleton/Skeleton";
import { Search, X } from "lucide-react";
import { useState } from "react";
import styles from "./Autocomplete.module.css";

export type AutocompleteOption = {
  value: string;
  label: string;
  description?: string;
};

type AutocompleteProps = {
  id: string;
  label: string;
  search: string;
  options: AutocompleteOption[];
  onSearchChange: (value: string) => void;
  onSelect: (option: AutocompleteOption) => void;
  onClear?: () => void;
  loading?: boolean;
  placeholder?: string;
  helperText?: string;
  error?: string;
  emptyMessage?: string;
  required?: boolean;
  optional?: boolean;
  containerClassName?: string;
};

export const Autocomplete = ({
  id,
  label,
  search,
  options,
  onSearchChange,
  onSelect,
  onClear,
  loading = false,
  placeholder,
  helperText,
  error,
  emptyMessage = "Nenhum resultado encontrado.",
  required,
  optional = false,
  containerClassName,
}: AutocompleteProps) => {
  const [open, setOpen] = useState(false);
  const showList = open && (loading || options.length > 0 || search);
  const describedBy = error
    ? `${id}-error`
    : helperText
      ? `${id}-helper`
      : undefined;

  return (
    <div
      className={[styles.formGroup, containerClassName]
        .filter(Boolean)
        .join(" ")}
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

      <div className={styles.wrapper}>
        <Search className={styles.searchIcon} size={16} />
        <input
          id={id}
          className={`${styles.input} ${error ? styles.inputError : ""}`}
          value={search}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          placeholder={placeholder}
          autoComplete="off"
          required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
        />

        {search && onClear && (
          <button
            type="button"
            className={styles.clearButton}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onClear();
              setOpen(false);
            }}
            aria-label="Limpar seleção"
          >
            <X size={15} />
          </button>
        )}

        {showList && (
          <div className={styles.listbox}>
            {loading ? (
              <div className={styles.loadingList}>
                <Skeleton height="16px" />
                <Skeleton height="16px" />
                <Skeleton height="16px" />
              </div>
            ) : options.length > 0 ? (
              options.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={styles.option}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onSelect(option);
                    setOpen(false);
                  }}
                >
                  <span className={styles.optionLabel}>{option.label}</span>
                  {option.description && (
                    <span className={styles.optionDescription}>
                      {option.description}
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div className={styles.emptyState}>{emptyMessage}</div>
            )}
          </div>
        )}
      </div>

      {error ? (
        <span id={`${id}-error`} className={styles.errorText}>
          {error}
        </span>
      ) : helperText ? (
        <span id={`${id}-helper`} className={styles.helperText}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
};
