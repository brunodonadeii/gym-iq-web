import { authFetch } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardKeys, retentionAlertKeys } from "@/queries/dashboardKeys";
import type { ApiError } from "@/utils/apiError";

async function generateRetentionAlerts() {
  const response = await authFetch(
    "retention-alerts/generate-active-students",
    {
      method: "POST",
    },
  );

  const responseData = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
}

export function useGenerateRetentionAlerts() {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiError, void>({
    mutationFn: generateRetentionAlerts,

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
