import type { Plan } from "@/pages/Plans/types";
import { authFetch } from "@/services/api";
import type { ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";


async function deactivatePlan({ id }: { id: string }) {
  const response = await authFetch(`plans/${id}/deactivate`, {
    method: "PATCH",
  });

  const responseData = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
}

export function useDeactivatePlan() {
  const queryClient = useQueryClient();

  return useMutation<Plan | null, ApiError, { id: string }>({
    mutationFn: deactivatePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["plans"],
      });
    },
  });
}

