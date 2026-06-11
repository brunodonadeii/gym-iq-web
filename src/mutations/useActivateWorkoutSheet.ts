import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function activateWorkoutSheet({ id }: { id: string }) {
  const response = await authFetch(`workout-sheets/${id}/activate`, {
    method: "PATCH",
  });

  return parseApiResponse<unknown>(response);
}

export function useActivateWorkoutSheet() {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiError, { id: string }>({
    mutationFn: activateWorkoutSheet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-sheets"] });
    },
  });
}
