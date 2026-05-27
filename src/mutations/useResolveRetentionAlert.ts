import type { RetentionAlert } from "@/pages/Dashboard/types";
import { authFetch } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardKeys, retentionAlertKeys } from "@/queries/dashboardKeys";

interface ApiError {
  erro?: string;
  mensagem?: string;
  message?: string;
}

async function resolveRetentionAlert({ id }: { id: string }) {
  const response = await authFetch(`retention-alerts/${id}/resolve`, {
    method: "PATCH",
  });

  const responseData = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
}

export function useResolveRetentionAlert() {
  const queryClient = useQueryClient();

  return useMutation<RetentionAlert | null, ApiError, { id: string }>({
    mutationFn: resolveRetentionAlert,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.retention(),
      });
      queryClient.invalidateQueries({
        queryKey: retentionAlertKeys.open(),
      });
    },
  });
}
