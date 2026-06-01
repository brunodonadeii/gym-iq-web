import { authFetch } from "@/services/api";
import type { ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deletePlan({ id }: { id: string }) {
  const response = await authFetch(`plans/${id}`, {
    method: "DELETE",
  });

  const responseData = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
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
