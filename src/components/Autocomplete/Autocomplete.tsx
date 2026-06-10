import { Skeleton } from "@/components/Skeleton/Skeleton";
import { Search, X } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type UIEvent,
} from "react";
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
  hasMoreOptions?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  loadMoreMessage?: string;
  searchDebounceMs?: number;
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
  hasMoreOptions = false,
  loadingMore = false,
  onLoadMore,
  loadMoreMessage = "Role para ver mais",
  searchDebounceMs = 300,
  required,
  optional = false,
  containerClassName,
}: AutocompleteProps) => {
  const [draftSearch, setDraftSearch] = useState(search);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const generatedId = useId();
  const listboxId = `${id}-${generatedId}-listbox`;
  const showList =
    open && (loading || options.length > 0 || Boolean(draftSearch));
  const safeActiveIndex =
    open && activeIndex >= 0 && activeIndex < options.length ? activeIndex : -1;
  const activeOption =
    safeActiveIndex >= 0 ? options[safeActiveIndex] : undefined;
  const activeOptionId = activeOption
    ? `${listboxId}-option-${activeOption.value}`
    : undefined;
  const describedBy = error
    ? `${id}-error`
    : helperText
      ? `${id}-helper`
      : undefined;

  useEffect(() => {
    setDraftSearch(search);
  }, [search]);

  useEffect(() => {
    if (draftSearch === search) {
      return;
    }

    const timeout = window.setTimeout(() => {
      onSearchChange(draftSearch);
    }, searchDebounceMs);

    return () => window.clearTimeout(timeout);
  }, [draftSearch, onSearchChange, search, searchDebounceMs]);

  const selectOption = (option: AutocompleteOption) => {
    setDraftSearch(option.label);
    onSelect(option);
    setOpen(false);
    setActiveIndex(-1);
  };

  const loadMoreIfNeeded = () => {
    if (!open || !hasMoreOptions || loading || loadingMore || !onLoadMore) {
      return;
    }

    onLoadMore();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);

      if (options.length === 0) return;

      setActiveIndex((current) =>
        current < options.length - 1 ? current + 1 : 0,
      );

      if (activeIndex >= options.length - 2) {
        loadMoreIfNeeded();
      }

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);

      if (options.length === 0) return;

      setActiveIndex((current) =>
        current > 0 ? current - 1 : options.length - 1,
      );
      return;
    }

    if (event.key === "Enter" && open && activeOption) {
      event.preventDefault();
      selectOption(activeOption);
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleListboxScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const distanceToBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight;

    if (distanceToBottom <= 32) {
      loadMoreIfNeeded();
    }
  };

  useEffect(() => {
    if (!open || !hasMoreOptions || loading || loadingMore) {
      return;
    }

    const root = listboxRef.current;
    const target = loadMoreRef.current;

    if (!root || !target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMoreIfNeeded();
        }
      },
      {
        root,
        rootMargin: "0px 0px 48px 0px",
        threshold: 0.1,
      },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [open, hasMoreOptions, loading, loadingMore, options.length]);

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
          value={draftSearch}
          onChange={(e) => {
            setDraftSearch(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          required={required}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={showList ? listboxId : undefined}
          aria-activedescendant={activeOptionId}
          aria-invalid={!!error}
          aria-describedby={describedBy}
        />

        {draftSearch && onClear && (
          <button
            type="button"
            className={styles.clearButton}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setDraftSearch("");
              onClear();
              setOpen(false);
              setActiveIndex(-1);
            }}
            aria-label="Limpar seleção"
          >
            <X size={15} />
          </button>
        )}

        {showList && (
          <div
            id={listboxId}
            ref={listboxRef}
            className={styles.listbox}
            role="listbox"
            onScroll={handleListboxScroll}
          >
            {loading ? (
              <div className={styles.loadingList} aria-label="Carregando opções">
                <Skeleton height="16px" />
                <Skeleton height="16px" />
                <Skeleton height="16px" />
              </div>
            ) : options.length > 0 ? (
              <>
                {options.map((option, index) => {
                  const optionId = `${listboxId}-option-${option.value}`;
                  const active = index === safeActiveIndex;

                  return (
                    <button
                      id={optionId}
                      type="button"
                      key={option.value}
                      className={`${styles.option} ${
                        active ? styles.optionActive : ""
                      }`}
                      role="option"
                      aria-selected={active}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => selectOption(option)}
                    >
                      <span className={styles.optionLabel}>{option.label}</span>
                      {option.description && (
                        <span className={styles.optionDescription}>
                          {option.description}
                        </span>
                      )}
                    </button>
                  );
                })}

                {(loadingMore || hasMoreOptions) && (
                  <>
                    <div className={styles.listStatus} role="status">
                      {loadingMore ? "Carregando mais..." : loadMoreMessage}
                    </div>
                    <div
                      ref={loadMoreRef}
                      className={styles.loadMoreSentinel}
                      aria-hidden="true"
                    />
                  </>
                )}
              </>
            ) : (
              <div className={styles.emptyState} role="status">
                {emptyMessage}
              </div>
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
