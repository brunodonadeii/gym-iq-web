import type { Exercise, ExerciseFormData } from "@/pages/Exercises/types";
import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type UpdateExerciseData = {
  id: string;
  data: ExerciseFormData;
};

async function updateExercise({ id, data }: UpdateExerciseData) {
  const response = await authFetch(`exercises/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: data.name,
      muscleGroup: data.muscleGroup,
      description: data.description || undefined,
    }),
  });

  return parseApiResponse<Exercise>(response);
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();

  return useMutation<Exercise, ApiError, UpdateExerciseData>({
    mutationFn: updateExercise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}

