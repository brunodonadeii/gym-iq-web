import {
  INSTRUCTOR_SPECIALTY_OPTIONS,
  parseInstructorSpecialties,
  stringifyInstructorSpecialties,
} from "@/pages/Instructors/specialties";
import styles from "./SpecialtySelector.module.css";

type SpecialtySelectorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export const SpecialtySelector = ({
  value,
  onChange,
  disabled = false,
}: SpecialtySelectorProps) => {
  const selectedValues = parseInstructorSpecialties(value);

  const toggleValue = (specialty: string) => {
    if (disabled) return;

    const nextValues = selectedValues.includes(specialty)
      ? selectedValues.filter((item) => item !== specialty)
      : [...selectedValues, specialty];

    onChange(stringifyInstructorSpecialties(nextValues));
  };

  return (
    <div className={styles.group}>
      <div className={styles.labelRow}>
        <span className={styles.label}>Especialidades</span>
        <span className={styles.helper}>Selecione uma ou mais opções</span>
      </div>

      <div className={styles.options}>
        {INSTRUCTOR_SPECIALTY_OPTIONS.map((specialty) => {
          const selected = selectedValues.includes(specialty);

          return (
            <label key={specialty} className={styles.option}>
              <input
                className={styles.checkbox}
                type="checkbox"
                checked={selected}
                onChange={() => toggleValue(specialty)}
                disabled={disabled}
              />
              <span
                className={[
                  styles.pill,
                  selected && styles.selected,
                  disabled && styles.disabled,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {specialty}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};


