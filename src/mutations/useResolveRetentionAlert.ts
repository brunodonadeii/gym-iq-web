import type { RetentionAlert } from "@/pages/Dashboard/types";
import { authFetch } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardKeys, retentionAlertKeys } from "@/queries/dashboardKeys";
import { parseApiResponse, type ApiError } from "@/utils/apiError";

async function resolveRetentionAlert({ id }: { id: string }) {
  const response = await authFetch(`retention-alerts/${id}/resolve`, {
    method: "PATCH",
  });

  return parseApiResponse<RetentionAlert | null>(response);
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
        queryKey: retentionAlertKeys.all,
      });
    },
  });
}

