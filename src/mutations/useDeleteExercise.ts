import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type DeleteExerciseData = {
  id: string;
};

async function deleteExercise({ id }: DeleteExerciseData) {
  const response = await authFetch(`exercises/${id}`, {
    method: "DELETE",
  });

  return parseApiResponse<unknown>(response);
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

