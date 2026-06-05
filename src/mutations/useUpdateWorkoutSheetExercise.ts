import type {
  WorkoutSheetExercise,
  WorkoutSheetExerciseFormData,
} from "@/pages/WorkoutSheets/types";
import { authFetch } from "@/services/api";
import type { ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type UpdateWorkoutSheetExerciseData = {
  id: string;
  workoutSheetId: string;
  data: WorkoutSheetExerciseFormData;
};

const normalizeExercise = (data: WorkoutSheetExerciseFormData) => ({
  exerciseId: Number(data.exerciseId),
  sets: Number(data.sets),
  repetitions: data.repetitions,
  loadKg: data.loadKg ? Number(data.loadKg) : undefined,
  restSeconds: data.restSeconds ? Number(data.restSeconds) : undefined,
  trainingSection: data.trainingSection || undefined,
  executionOrder: Number(data.executionOrder),
  notes: data.notes || undefined,
});

async function updateWorkoutSheetExercise({
  id,
  data,
}: UpdateWorkoutSheetExerciseData) {
  const response = await authFetch(`workout-sheet-exercises/${id}`, {
    method: "PUT",
    body: JSON.stringify(normalizeExercise(data)),
  });
  const responseData = await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
}

export function useUpdateWorkoutSheetExercise() {
  const queryClient = useQueryClient();

  return useMutation<
    WorkoutSheetExercise,
    ApiError,
    UpdateWorkoutSheetExerciseData
  >({
    mutationFn: updateWorkoutSheetExercise,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workout-sheets", variables.workoutSheetId, "exercises"],
      });
      queryClient.invalidateQueries({
        queryKey: ["workout-sheets", variables.workoutSheetId],
      });
    },
  });
}

