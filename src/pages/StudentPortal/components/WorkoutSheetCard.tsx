import { Button } from "@/components/Button/Button";
import type { WorkoutSheet } from "@/pages/WorkoutSheets/types";
import { ChevronDown, Printer } from "lucide-react";
import { printWorkoutSheetReceipt } from "../printWorkoutSheetReceipt";
import { formatExerciseMeta } from "../utils";
import styles from "../StudentPortalPage.module.css";

type WorkoutSheetCardProps = {
  expanded: boolean;
  onToggle: () => void;
  sheet: WorkoutSheet;
};

export const WorkoutSheetCard = ({
  expanded,
  onToggle,
  sheet,
}: WorkoutSheetCardProps) => {
  const exercises = sheet.exercises?.slice().sort(
    (a, b) => Number(a.executionOrder ?? 0) - Number(b.executionOrder ?? 0),
  );

  return (
    <div className={styles.sheetItem}>
      <div className={styles.sheetSummary}>
        <div>
          <p className={styles.itemTitle}>{sheet.name}</p>
          <p className={styles.itemDescription}>
            {sheet.goal ?? "Sem objetivo informado"} | Instrutor:{" "}
            {sheet.instructorName ?? sheet.instructor?.name ?? "Nao informado"}
          </p>
        </div>
        <span className={styles.badge}>
          {sheet.exercises?.length ?? 0} exercicio(s)
        </span>
      </div>

      <div className={styles.sheetActions}>
        <Button variant="ghost" leftIcon={<ChevronDown size={16} />} onClick={onToggle}>
          {expanded ? "Ocultar exercicios" : "Ver exercicios"}
        </Button>
        <Button
          variant="secondary"
          leftIcon={<Printer size={16} />}
          onClick={() => printWorkoutSheetReceipt(sheet)}
        >
          Imprimir
        </Button>
      </div>

      {expanded && (
        <div className={styles.exercisePanel}>
          {exercises?.length ? (
            exercises.map((exercise) => (
              <div
                className={styles.exerciseItem}
                key={exercise.workoutSheetExerciseId}
              >
                <div>
                  <p className={styles.itemTitle}>
                    {exercise.executionOrder}. {exercise.exerciseName}
                  </p>
                  <p className={styles.itemDescription}>
                    {formatExerciseMeta(
                      exercise.sets,
                      exercise.repetitions,
                      exercise.restSeconds,
                    ) || "Sem detalhes informados"}
                  </p>
                </div>
                <span className={styles.exerciseNote}>
                  {exercise.notes || exercise.muscleGroup || "-"}
                </span>
              </div>
            ))
          ) : (
            <div className={styles.empty}>
              Esta ficha ainda nao possui exercicios listados.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
