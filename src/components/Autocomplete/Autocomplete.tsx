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
  emptyMessage?: string;
  required?: boolean;
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
  emptyMessage = "Nenhum resultado encontrado.",
  required,
  containerClassName,
}: AutocompleteProps) => {
  const [open, setOpen] = useState(false);
  const showList = open && (loading || options.length > 0 || search);

  return (
    <div
      className={[styles.formGroup, containerClassName]
        .filter(Boolean)
        .join(" ")}
    >
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>

      <div className={styles.wrapper}>
        <Search className={styles.searchIcon} size={16} />
        <input
          id={id}
          className={styles.input}
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
            aria-label="Limpar selecao"
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

      {helperText && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
};
