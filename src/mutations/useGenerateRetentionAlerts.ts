import { authFetch } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardKeys, retentionAlertKeys } from "@/queries/dashboardKeys";
import { parseApiResponse, type ApiError } from "@/utils/apiError";

async function generateRetentionAlerts() {
  const response = await authFetch(
    "retention-alerts/generate-active-students",
    {
      method: "POST",
    },
  );

  return parseApiResponse<unknown>(response);
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

