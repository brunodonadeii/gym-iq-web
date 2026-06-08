import type { WorkoutSheetExerciseFormData } from "./types";

export const WORKOUT_SHEET_EXERCISE_LIMITS = {
  sets: {
    min: 1,
    max: 100,
  },
  restSeconds: {
    min: 0,
    max: 1200,
  },
  executionOrder: {
    min: 1,
    max: 100,
  },
} as const;

export type WorkoutSheetExerciseFormErrors = Partial<
  Record<keyof WorkoutSheetExerciseFormData, string>
>;

const hasValue = (value: string | number | null | undefined) =>
  String(value ?? "").trim().length > 0;

const toNumber = (value: string | number | null | undefined) =>
  Number(String(value ?? "").trim());

export const validateWorkoutSheetExercise = (
  exercise: WorkoutSheetExerciseFormData,
  options: { requireExerciseId?: boolean; requireTrainingSection?: boolean } = {},
) => {
  const errors: WorkoutSheetExerciseFormErrors = {};
  const { requireExerciseId = true, requireTrainingSection = true } = options;
  const sets = toNumber(exercise.sets);
  const restSeconds = toNumber(exercise.restSeconds);
  const executionOrder = toNumber(exercise.executionOrder);

  if (requireExerciseId && !exercise.exerciseId) {
    errors.exerciseId = "Selecione o exercício.";
  }

  if (!hasValue(exercise.sets) || Number.isNaN(sets)) {
    errors.sets = "Informe o número de séries.";
  } else if (sets < WORKOUT_SHEET_EXERCISE_LIMITS.sets.min) {
    errors.sets = "Informe um número de séries maior que zero.";
  } else if (sets > WORKOUT_SHEET_EXERCISE_LIMITS.sets.max) {
    errors.sets = `Informe no máximo ${WORKOUT_SHEET_EXERCISE_LIMITS.sets.max} séries.`;
  }

  if (!exercise.repetitions.trim()) {
    errors.repetitions = "Informe as repetições.";
  }

  if (hasValue(exercise.restSeconds)) {
    if (Number.isNaN(restSeconds)) {
      errors.restSeconds = "Informe o descanso em segundos.";
    } else if (restSeconds < WORKOUT_SHEET_EXERCISE_LIMITS.restSeconds.min) {
      errors.restSeconds = "Informe um descanso maior ou igual a zero.";
    } else if (restSeconds > WORKOUT_SHEET_EXERCISE_LIMITS.restSeconds.max) {
      errors.restSeconds = `Informe no máximo ${WORKOUT_SHEET_EXERCISE_LIMITS.restSeconds.max} segundos.`;
    }
  }

  if (requireTrainingSection && !exercise.trainingSection.trim()) {
    errors.trainingSection = "Informe o bloco do treino.";
  }

  if (!hasValue(exercise.executionOrder) || Number.isNaN(executionOrder)) {
    errors.executionOrder = "Informe a ordem.";
  } else if (
    executionOrder < WORKOUT_SHEET_EXERCISE_LIMITS.executionOrder.min
  ) {
    errors.executionOrder = "Informe uma ordem maior que zero.";
  } else if (
    executionOrder > WORKOUT_SHEET_EXERCISE_LIMITS.executionOrder.max
  ) {
    errors.executionOrder = `Informe no máximo a ordem ${WORKOUT_SHEET_EXERCISE_LIMITS.executionOrder.max}.`;
  }

  return errors;
};
