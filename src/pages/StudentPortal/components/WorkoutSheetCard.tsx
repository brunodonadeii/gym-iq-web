import { Button } from "@/components/Button/Button";
import { Skeleton } from "@/components/Skeleton/Skeleton";
import type { WorkoutSheetSummary } from "@/pages/WorkoutSheets/types";
import { useGetWorkoutSheetById } from "@/queries/useGetWorkoutSheetById";
import { ChevronDown, Printer } from "lucide-react";
import { printWorkoutBlock } from "../printWorkoutSheetReceipt";
import { formatExerciseMeta } from "../utils";
import styles from "../StudentPortalPage.module.css";

type WorkoutSheetCardProps = {
  expanded: boolean;
  onToggle: () => void;
  sheet: WorkoutSheetSummary;
};

export const WorkoutSheetCard = ({
  expanded,
  onToggle,
  sheet,
}: WorkoutSheetCardProps) => {
  const {
    data: details,
    error,
    isFetching,
    isLoading,
  } = useGetWorkoutSheetById(expanded ? String(sheet.workoutSheetId) : undefined);
  const blocks = details?.blocks ?? [];
  const blocksLoading = isLoading || isFetching;

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
          {blocksLoading
            ? "Carregando..."
            : `${blocks.length} treino(s)`}
        </span>
      </div>

      <div className={styles.sheetActions}>
        <Button
          variant="ghost"
          leftIcon={<ChevronDown size={16} />}
          onClick={onToggle}
        >
          {expanded ? "Ocultar treinos" : "Ver treinos"}
        </Button>
      </div>

      {expanded && (
        <div className={styles.exercisePanel}>
          {blocksLoading ? (
            <>
              <Skeleton height="46px" radius="12px" />
              <Skeleton height="46px" radius="12px" />
            </>
          ) : error ? (
            <div className={styles.empty}>
              Não foi possível carregar os treinos desta ficha.
            </div>
          ) : blocks.length ? (
            blocks
              .slice()
              .sort(
                (a, b) =>
                  Number(a.executionOrder ?? 0) -
                  Number(b.executionOrder ?? 0),
              )
              .map((block) => (
                <section className={styles.exerciseGroup} key={block.name}>
                  <div className={styles.exerciseGroupHeader}>
                    <div>
                      <span className={styles.exerciseGroupTitle}>
                        {block.name}
                      </span>
                      {block.description && (
                        <p className={styles.itemDescription}>
                          {block.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="secondary"
                      leftIcon={<Printer size={16} />}
                      onClick={() => printWorkoutBlock(sheet, block)}
                    >
                      Imprimir treino
                    </Button>
                  </div>

                  {(block.exercises ?? []).length ? (
                    (block.exercises ?? [])
                      .slice()
                      .sort(
                        (a, b) =>
                          Number(a.executionOrder ?? 0) -
                          Number(b.executionOrder ?? 0),
                      )
                      .map((exercise) => (
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
                      Este treino ainda não possui exercícios.
                    </div>
                  )}
                </section>
              ))
          ) : (
            <div className={styles.empty}>
              Esta ficha ainda não possui treinos cadastrados.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
