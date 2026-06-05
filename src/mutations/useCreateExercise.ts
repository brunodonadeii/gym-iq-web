import type { Exercise, ExerciseFormData } from "@/pages/Exercises/types";
import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function createExercise({ data }: { data: ExerciseFormData }) {
  const response = await authFetch("exercises", {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      muscleGroup: data.muscleGroup,
      description: data.description || undefined,
    }),
  });

  return parseApiResponse<Exercise>(response);
}

export function useCreateExercise() {
  const queryClient = useQueryClient();

  return useMutation<Exercise, ApiError, { data: ExerciseFormData }>({
    mutationFn: createExercise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}

