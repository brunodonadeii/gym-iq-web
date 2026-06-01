import { authFetch } from "@/services/api";
import type { ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function refreshOverduePayments() {
  const response = await authFetch("payments/refresh-overdue", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
}

export function useRefreshOverduePayments() {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiError, void>({
    mutationFn: refreshOverduePayments,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payments"],
      });
    },
  });
}
