import type { OperationsDashboard } from "@/pages/Dashboard/types";
import { authFetch } from "@/services/api";
import { parseApiResponse } from "@/utils/apiError";
import { useQuery } from "@tanstack/react-query";
import { dashboardKeys } from "./dashboardKeys";

async function fetchOperationsDashboard(): Promise<OperationsDashboard> {
  const response = await authFetch("dashboard/operations");

  return parseApiResponse(response, "Erro ao buscar dashboard operacional");
}

export function useGetOperationsDashboard(enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.operations(),
    queryFn: fetchOperationsDashboard,
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
