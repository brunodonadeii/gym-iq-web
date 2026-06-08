import { Button } from "@/components/Button/Button";
import { Skeleton } from "@/components/Skeleton/Skeleton";
import type { WorkoutSheet } from "@/pages/WorkoutSheets/types";
import {
  fetchWorkoutSheetExercises,
  useGetWorkoutSheetExercises,
} from "@/queries/useGetWorkoutSheetExercises";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Printer } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { printWorkoutSheetReceipt } from "../printWorkoutSheetReceipt";
import { formatExerciseMeta, groupExercisesByTrainingSection } from "../utils";
import styles from "../StudentPortalPage.module.css";

const EXERCISES_PAGE = {
  page: 0,
  size: 100,
  sort: "executionOrder,asc",
};

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
  const queryClient = useQueryClient();
  const [printRequested, setPrintRequested] = useState(false);
  const {
    data: exercisesPage,
    error,
    isFetching,
    isLoading,
  } = useGetWorkoutSheetExercises(
    String(sheet.workoutSheetId),
    EXERCISES_PAGE,
    expanded || printRequested,
  );
  const exercises = exercisesPage?.content ?? [];
  const exerciseGroups = groupExercisesByTrainingSection(exercises);
  const exercisesLoading = isLoading || isFetching;
  const exercisesQueryKey = [
    "workout-sheets",
    String(sheet.workoutSheetId),
    "exercises",
    EXERCISES_PAGE,
  ];

  const handlePrint = async () => {
    setPrintRequested(true);

    try {
      const loadedExercisesPage = exercisesPage
        ? exercisesPage
        : await queryClient.fetchQuery({
            queryKey: exercisesQueryKey,
            queryFn: () =>
              fetchWorkoutSheetExercises(
                String(sheet.workoutSheetId),
                EXERCISES_PAGE,
              ),
            staleTime: 5 * 60 * 1000,
          });

      printWorkoutSheetReceipt({
        ...sheet,
        exercises: loadedExercisesPage.content,
      });
    } catch {
      toast.error("Não foi possível carregar os exercícios para impressão.");
    }
  };

  return (
    <div className={styles.sheetItem}>
      <div className={styles.sheetSummary}>
        <div>
          <p className={styles.itemTitle}>{sheet.name}</p>
          <p className={styles.itemDescription}>
            {sheet.goal ?? "Sem objetivo informado"} | Instrutor:{" "}
            {sheet.instructorName ?? sheet.instructor?.name ?? "Não informado"}
          </p>
        </div>
        <span className={styles.badge}>
          {exercisesLoading
            ? "Carregando..."
            : `${exercisesPage?.totalElements ?? exercises.length} exercício(s)`}
        </span>
      </div>

      <div className={styles.sheetActions}>
        <Button
          variant="ghost"
          leftIcon={<ChevronDown size={16} />}
          onClick={onToggle}
        >
          {expanded ? "Ocultar exercícios" : "Ver exercícios"}
        </Button>
        <Button
          variant="secondary"
          leftIcon={<Printer size={16} />}
          onClick={handlePrint}
          disabled={exercisesLoading}
        >
          Imprimir
        </Button>
      </div>

      {expanded && (
        <div className={styles.exercisePanel}>
          {exercisesLoading ? (
            <>
              <Skeleton height="46px" radius="12px" />
              <Skeleton height="46px" radius="12px" />
            </>
          ) : error ? (
            <div className={styles.empty}>
              Não foi possível carregar os exercícios desta ficha.
            </div>
          ) : exerciseGroups.length ? (
            exerciseGroups.map((group) => (
              <section className={styles.exerciseGroup} key={group.section}>
                <div className={styles.exerciseGroupHeader}>
                  <span className={styles.exerciseGroupTitle}>
                    {group.section}
                  </span>
                </div>

                {group.exercises.map((exercise) => (
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
                ))}
              </section>
            ))
          ) : (
            <div className={styles.empty}>
              Esta ficha ainda não possui exercícios listados.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
