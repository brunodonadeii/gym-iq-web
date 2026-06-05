import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deletePlan({ id }: { id: string }) {
  const response = await authFetch(`plans/${id}`, {
    method: "DELETE",
  });

  return parseApiResponse<unknown>(response);
}

export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiError, { id: string }>({
    mutationFn: deletePlan,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["plans"],
      });
    },
  });
}

