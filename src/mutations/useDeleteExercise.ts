import { authFetch } from "@/services/api";
import type { ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type DeleteExerciseData = {
  id: string;
};

async function deleteExercise({ id }: DeleteExerciseData) {
  const response = await authFetch(`exercises/${id}`, {
    method: "DELETE",
  });
  const responseData = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiError, DeleteExerciseData>({
    mutationFn: deleteExercise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}
