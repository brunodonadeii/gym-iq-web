import type { RetentionDashboard } from "@/pages/Dashboard/types";
import { authFetch } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { throwDashboardRequestError } from "./dashboardError";
import { dashboardKeys } from "./dashboardKeys";

async function fetchRetentionDashboard(): Promise<RetentionDashboard> {
  const response = await authFetch("dashboard/retention");

  if (!response.ok) {
    await throwDashboardRequestError(
      response,
      "Erro ao buscar dashboard de retenção",
    );
  }

  return response.json();
}

export function useGetRetentionDashboard(enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.retention(),
    queryFn: fetchRetentionDashboard,
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
