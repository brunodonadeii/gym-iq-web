import { Button } from "@/components/Button/Button";
import { DetailLoadState } from "@/components/DetailLoadState/DetailLoadState";
import { Skeleton } from "@/components/Skeleton/Skeleton";
import type { WorkoutBlock, WorkoutSheet, WorkoutSheetExercise } from "@/pages/WorkoutSheets/types";
import { useGetWorkoutSheetById } from "@/queries/useGetWorkoutSheetById";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import styles from "./WorkoutSheetsDetails.module.css";

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "-";

const resolveExerciseName = (exercise: WorkoutSheetExercise) =>
  exercise.exerciseName ?? `Exercício #${exercise.exerciseId}`;

const resolveStudentName = (details?: WorkoutSheet) =>
  details?.student?.name ?? details?.studentName ?? "-";

const resolveInstructorName = (details?: WorkoutSheet) =>
  details?.instructor?.name ?? details?.instructorName ?? "-";

const getWorkoutSheetBlocks = (details?: WorkoutSheet): WorkoutBlock[] => {
  if (details?.blocks?.length) return details.blocks;

  const legacyExercises = details?.exercises ?? [];
  const groups = new Map<string, WorkoutSheetExercise[]>();

  legacyExercises.forEach((exercise) => {
    const section = exercise.trainingSection?.trim() || "Treino";
    groups.set(section, [...(groups.get(section) ?? []), exercise]);
  });

  return Array.from(groups.entries()).map(([name, exercises], index) => ({
    name,
    description: null,
    executionOrder: index + 1,
    exercises,
  }));
};

const sortExercises = (exercises: WorkoutSheetExercise[] = []) =>
  [...exercises].sort(
    (left, right) =>
      Number(left.executionOrder ?? 0) - Number(right.executionOrder ?? 0),
  );

type WorkoutSheetsDetailsContentProps = {
  details?: WorkoutSheet;
  isLoadingDetails: boolean;
  workoutSheetId?: string;
};

const WorkoutSheetsDetailsContent = ({
  details,
  isLoadingDetails,
  workoutSheetId,
}: WorkoutSheetsDetailsContentProps) => {
  const navigate = useNavigate();
  const blocks = getWorkoutSheetBlocks(details).sort(
    (left, right) =>
      Number(left.executionOrder ?? 0) - Number(right.executionOrder ?? 0),
  );

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{details?.name ?? "Ficha de treino"}</h2>
            <p className={styles.subtitle}>
              Visualize os dados da ficha e os exercícios agrupados por bloco.
            </p>
          </div>

          {!isLoadingDetails && workoutSheetId && (
            <Button
              leftIcon={<Pencil size={18} />}
              onClick={() =>
                navigate({
                  to: "/workout-sheets/$workoutSheetId/edit",
                  params: { workoutSheetId: String(workoutSheetId) },
                })
              }
            >
              Editar ficha
            </Button>
          )}
        </div>

        {isLoadingDetails ? (
          <div className={styles.skeletonGrid}>
            <Skeleton height="88px" />
            <Skeleton height="88px" />
            <Skeleton height="88px" />
            <Skeleton height="88px" />
          </div>
        ) : (
          <div className={styles.infoGrid}>
            <article className={styles.infoCard}>
              <span className={styles.infoLabel}>Aluno</span>
              <strong className={styles.infoValue}>
                {resolveStudentName(details)}
              </strong>
              <span className={styles.infoHint}>{details?.student?.email ?? details?.studentEmail ?? "-"}</span>
            </article>
            <article className={styles.infoCard}>
              <span className={styles.infoLabel}>Instrutor</span>
              <strong className={styles.infoValue}>
                {resolveInstructorName(details)}
              </strong>
              <span className={styles.infoHint}>{details?.instructor?.email ?? "-"}</span>
            </article>
            <article className={styles.infoCard}>
              <span className={styles.infoLabel}>Objetivo</span>
              <strong className={styles.infoValue}>{details?.goal || "-"}</strong>
              <span className={styles.infoHint}>
                Início: {formatDate(details?.startDate)}
              </span>
            </article>
            <article className={styles.infoCard}>
              <span className={styles.infoLabel}>Status</span>
              <strong className={styles.infoValue}>
                {details?.active ? "Ativa" : "Inativa"}
              </strong>
              <span className={styles.infoHint}>
                Fim: {formatDate(details?.endDate)}
              </span>
            </article>
          </div>
        )}

        {!isLoadingDetails && (
          <div className={styles.notesCard}>
            <span className={styles.infoLabel}>Observações</span>
            <p className={styles.notesText}>{details?.notes || "Nenhuma observação informada."}</p>
          </div>
        )}
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Blocos da ficha</h3>
            <p className={styles.sectionDescription}>
              Cada bloco representa um treino com seus exercícios organizados pela ordem definida.
            </p>
          </div>
        </div>

        {isLoadingDetails ? (
          <div className={styles.blockList}>
            <Skeleton height="220px" />
            <Skeleton height="220px" />
          </div>
        ) : blocks.length === 0 ? (
          <div className={styles.emptyState}>
            Nenhum bloco encontrado para esta ficha.
          </div>
        ) : (
          <div className={styles.blockList}>
            {blocks.map((block, blockIndex) => {
              const exercises = sortExercises(block.exercises);

              return (
                <article
                  key={`${block.name}-${block.executionOrder}-${blockIndex}`}
                  className={styles.blockCard}
                >
                  <div className={styles.blockHeader}>
                    <div>
                      <span className={styles.blockOrder}>
                        Bloco {blockIndex + 1}
                      </span>
                      <h4 className={styles.blockTitle}>{block.name}</h4>
                      <p className={styles.blockDescription}>
                        {block.description || "Sem descrição para este bloco."}
                      </p>
                    </div>
                    <span className={styles.blockCount}>
                      {exercises.length} exercício(s)
                    </span>
                  </div>

                  {exercises.length === 0 ? (
                    <div className={styles.emptyExerciseState}>
                      Nenhum exercício vinculado a este bloco.
                    </div>
                  ) : (
                    <div className={styles.exerciseList}>
                      {exercises.map((exercise, exerciseIndex) => (
                        <div
                          key={`${exercise.workoutSheetExerciseId}-${exerciseIndex}`}
                          className={styles.exerciseRow}
                        >
                          <div className={styles.exerciseMain}>
                            <strong className={styles.exerciseName}>
                              {exercise.executionOrder}. {resolveExerciseName(exercise)}
                            </strong>
                            <span className={styles.exerciseMeta}>
                              {exercise.repetitions} repetições
                            </span>
                          </div>
                          <div className={styles.exerciseStats}>
                            <span>Séries: {exercise.sets}</span>
                            <span>
                              Descanso: {exercise.restSeconds ? `${exercise.restSeconds}s` : "-"}
                            </span>
                            <span>Carga: {exercise.loadKg ? `${exercise.loadKg}kg` : "-"}</span>
                          </div>
                          <p className={styles.exerciseNotes}>
                            {exercise.notes || "Sem observações."}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={() => navigate({ to: "/workout-sheets" })}>
          Voltar
        </Button>
        {workoutSheetId && (
          <Button
            onClick={() =>
              navigate({
                to: "/workout-sheets/$workoutSheetId/edit",
                params: { workoutSheetId: String(workoutSheetId) },
              })
            }
          >
            Editar ficha
          </Button>
        )}
      </div>
    </div>
  );
};

export const WorkoutSheetsDetails = () => {
  const params = useParams({ strict: false });
  const workoutSheetId = params.workoutSheetId;
  const navigate = useNavigate();
  const {
    data: details,
    error,
    isError,
    isLoading: isLoadingDetails,
  } = useGetWorkoutSheetById(workoutSheetId);

  if (isLoadingDetails) {
    return (
      <DetailLoadState
        entity={{ name: "Ficha de treino", article: "esta", pronoun: "ela" }}
        loading
        onBack={() => navigate({ to: "/workout-sheets" })}
      />
    );
  }

  if (isError || (!isLoadingDetails && !details)) {
    return (
      <DetailLoadState
        entity={{ name: "Ficha de treino", article: "esta", pronoun: "ela" }}
        error={error}
        onBack={() => navigate({ to: "/workout-sheets" })}
      />
    );
  }

  return (
    <WorkoutSheetsDetailsContent
      details={details}
      isLoadingDetails={isLoadingDetails}
      workoutSheetId={workoutSheetId}
    />
  );
};
