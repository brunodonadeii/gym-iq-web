import type {
  WorkoutSheetExercise,
  WorkoutSheetExerciseFormData,
} from "@/pages/WorkoutSheets/types";
import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type CreateWorkoutSheetExerciseData = {
  workoutSheetId: string;
  workoutBlockId?: string;
  data: WorkoutSheetExerciseFormData;
};

const normalizeExercise = (data: WorkoutSheetExerciseFormData) => ({
  exerciseId: Number(data.exerciseId),
  sets: Number(data.sets),
  repetitions: data.repetitions,
  loadKg: data.loadKg ? Number(data.loadKg) : undefined,
  restSeconds: data.restSeconds ? Number(data.restSeconds) : undefined,
  executionOrder: Number(data.executionOrder),
  notes: data.notes || undefined,
});

async function createWorkoutSheetExercise({
  workoutSheetId,
  workoutBlockId,
  data,
}: CreateWorkoutSheetExerciseData) {
  const endpoint = workoutBlockId
    ? `workout-blocks/${workoutBlockId}/exercises`
    : `workout-sheets/${workoutSheetId}/exercises`;
  const response = await authFetch(endpoint, {
    method: "POST",
    body: JSON.stringify(normalizeExercise(data)),
  });

  return parseApiResponse<WorkoutSheetExercise>(response);
}

export function useCreateWorkoutSheetExercise() {
  const queryClient = useQueryClient();

  return useMutation<
    WorkoutSheetExercise,
    ApiError,
    CreateWorkoutSheetExerciseData
  >({
    mutationFn: createWorkoutSheetExercise,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workout-sheets", variables.workoutSheetId],
      });
      if (variables.workoutBlockId) {
        queryClient.invalidateQueries({
          queryKey: ["workout-blocks", variables.workoutBlockId],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: ["workout-sheets", variables.workoutSheetId, "exercises"],
        });
      }
    },
  });
}
