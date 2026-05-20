import type { Exercise, ExerciseFormData } from "@/pages/Exercises/types";
import { authFetch } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ApiError {
  erro: string;
  mensagem: string;
}

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
  const responseData = await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
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
