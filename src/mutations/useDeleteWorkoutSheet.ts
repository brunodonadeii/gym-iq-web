import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type DeleteWorkoutSheetData = {
  id: string;
};

async function deleteWorkoutSheet({ id }: DeleteWorkoutSheetData) {
  const response = await authFetch(`workout-sheets/${id}`, {
    method: "DELETE",
  });

  return parseApiResponse<unknown>(response);
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

