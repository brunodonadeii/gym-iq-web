import type { Plan } from "@/pages/Plans/types";
import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";


async function deactivatePlan({ id }: { id: string }) {
  const response = await authFetch(`plans/${id}/deactivate`, {
    method: "PATCH",
  });

  return parseApiResponse<Plan | null>(response);
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

