import { Button } from "@/components/Button/Button";
import { TextField } from "@/components/TextField/TextField";
import {
  DATE_RANGE_PRESETS,
  formatDateRangeLabel,
  getDateRangePresetValue,
  getMatchingDateRangePreset,
  type DateRangePresetKey,
  type DateRangeValue,
} from "@/components/DateRangePicker/dateRangeUtils";
import { CalendarRange, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./DateRangePicker.module.css";

type DateRangePickerProps = {
  id: string;
  label: string;
  value: DateRangeValue;
  onChange: (value: DateRangeValue, preset: DateRangePresetKey) => void;
  helperText?: string;
  disabled?: boolean;
  className?: string;
};

export const DateRangePicker = ({
  id,
  label,
  value,
  onChange,
  helperText,
  disabled = false,
  className,
}: DateRangePickerProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [draftRange, setDraftRange] = useState<DateRangeValue>(value);

  const activePreset = useMemo(
    () => getMatchingDateRangePreset(value),
    [value],
  );

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const triggerPresetLabel =
    DATE_RANGE_PRESETS.find((preset) => preset.key === activePreset)?.label ??
    "Personalizado";

  const handleSelectPreset = (preset: DateRangePresetKey) => {
    if (preset === "custom") {
      setCustomMode(true);
      return;
    }

    const nextValue = getDateRangePresetValue(preset);
    onChange(nextValue, preset);
    setCustomMode(false);
    setOpen(false);
  };

  const handleApplyCustomRange = () => {
    if (!draftRange.startDate || !draftRange.endDate) {
      return;
    }

    const nextRange =
      draftRange.startDate <= draftRange.endDate
        ? draftRange
        : {
            startDate: draftRange.endDate,
            endDate: draftRange.startDate,
          };

    onChange(nextRange, "custom");
    setOpen(false);
  };

  return (
    <div
      className={[styles.formGroup, className].filter(Boolean).join(" ")}
      ref={containerRef}
    >
      <label className={styles.label} htmlFor={id}>
        <span>{label}</span>
      </label>

      <button
        id={id}
        type="button"
        disabled={disabled}
        className={[styles.trigger, open && styles.triggerOpen]
          .filter(Boolean)
          .join(" ")}
        onClick={() => {
          setDraftRange(value);
          setCustomMode(activePreset === "custom");
          setOpen((prev) => !prev);
        }}
      >
        <span className={styles.triggerText}>
          <span className={styles.triggerPreset}>{triggerPresetLabel}</span>
          <span className={styles.triggerValue}>{formatDateRangeLabel(value)}</span>
        </span>
        <span className={styles.triggerIcon}>
          <CalendarRange size={18} />
          <ChevronDown size={16} />
        </span>
      </button>

      {helperText && <span className={styles.helperText}>{helperText}</span>}

      {open && (
        <div className={styles.panel}>
          <div className={styles.presetGrid}>
            {DATE_RANGE_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                className={[
                  styles.presetButton,
                  (preset.key === activePreset ||
                    (preset.key === "custom" && customMode)) &&
                    styles.presetButtonActive,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleSelectPreset(preset.key)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {customMode && (
            <div className={styles.customArea}>
              <div className={styles.dateFields}>
                <TextField
                  label="Início"
                  id={`${id}-start`}
                  type="date"
                  value={draftRange.startDate}
                  onChange={(event) =>
                    setDraftRange((prev) => ({
                      ...prev,
                      startDate: event.target.value,
                    }))
                  }
                />
                <TextField
                  label="Fim"
                  id={`${id}-end`}
                  type="date"
                  value={draftRange.endDate}
                  onChange={(event) =>
                    setDraftRange((prev) => ({
                      ...prev,
                      endDate: event.target.value,
                    }))
                  }
                />
              </div>

              <div className={styles.actions}>
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleApplyCustomRange}
                  disabled={!draftRange.startDate || !draftRange.endDate}
                >
                  Aplicar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


