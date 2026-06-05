import { authFetch } from "@/services/api";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function refreshOverduePayments() {
  const response = await authFetch("payments/refresh-overdue", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return parseApiResponse<unknown>(response);
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

