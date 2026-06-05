import type { Plan } from "@/pages/Plans/types";
import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function activatePlan({ id }: { id: string }) {
  const response = await authFetch(`plans/${id}/activate`, {
    method: "PATCH",
  });

  return parseApiResponse<Plan | null>(response);
}

export function useActivatePlan() {
  const queryClient = useQueryClient();

  return useMutation<Plan | null, ApiError, { id: string }>({
    mutationFn: activatePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["plans"],
      });
    },
  });
}

