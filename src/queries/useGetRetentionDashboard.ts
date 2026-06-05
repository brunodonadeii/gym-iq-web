import type { RetentionDashboard } from "@/pages/Dashboard/types";
import { authFetch } from "@/services/api";
import { parseApiResponse } from "@/utils/apiError";
import { useQuery } from "@tanstack/react-query";
import { dashboardKeys } from "./dashboardKeys";

async function fetchRetentionDashboard(): Promise<RetentionDashboard> {
  const response = await authFetch("dashboard/retention");

  return parseApiResponse(response, "Erro ao buscar dashboard de reten��o");
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


