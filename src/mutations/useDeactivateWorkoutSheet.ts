import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deactivateWorkoutSheet({ id }: { id: string }) {
  const response = await authFetch(`workout-sheets/${id}/inactive`, {
    method: "PATCH",
  });

  return parseApiResponse<unknown>(response);
}

export function useDeactivateWorkoutSheet() {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiError, { id: string }>({
    mutationFn: deactivateWorkoutSheet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-sheets"] });
    },
  });
}
