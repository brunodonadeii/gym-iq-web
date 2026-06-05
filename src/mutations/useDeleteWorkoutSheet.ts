import { authFetch } from "@/services/api";
import type { ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type DeleteWorkoutSheetData = {
  id: string;
};

async function deleteWorkoutSheet({ id }: DeleteWorkoutSheetData) {
  const response = await authFetch(`workout-sheets/${id}`, {
    method: "DELETE",
  });
  const responseData = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
}

export function useDeleteWorkoutSheet() {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiError, DeleteWorkoutSheetData>({
    mutationFn: deleteWorkoutSheet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-sheets"] });
    },
  });
}

