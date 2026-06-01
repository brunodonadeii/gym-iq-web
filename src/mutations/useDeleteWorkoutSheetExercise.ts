import { authFetch } from "@/services/api";
import type { ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type DeleteWorkoutSheetExerciseData = {
  id: string;
  workoutSheetId: string;
};

async function deleteWorkoutSheetExercise({ id }: DeleteWorkoutSheetExerciseData) {
  const response = await authFetch(`workout-sheet-exercises/${id}`, {
    method: "DELETE",
  });
  const responseData = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
}

export function useDeleteWorkoutSheetExercise() {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiError, DeleteWorkoutSheetExerciseData>({
    mutationFn: deleteWorkoutSheetExercise,
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
