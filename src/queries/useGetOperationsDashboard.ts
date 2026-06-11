import type { OperationsDashboard } from "@/pages/Dashboard/types";
import { authFetch } from "@/services/api";
import { parseApiResponse } from "@/utils/apiError";
import { buildPaginationParams } from "@/utils/pagination";
import { useQuery } from "@tanstack/react-query";
import { dashboardKeys } from "./dashboardKeys";

type DashboardDateFilters = {
  startDate?: string;
  endDate?: string;
};

async function fetchOperationsDashboard(
  filters: DashboardDateFilters,
): Promise<OperationsDashboard> {
  const query = buildPaginationParams(
    {},
    {
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    },
  );
  const response = await authFetch(
    `dashboard/operations${query ? `?${query}` : ""}`,
  );

  return parseApiResponse(response, "Erro ao buscar dashboard operacional");
}

export function useGetOperationsDashboard(
  enabled = true,
  filters: DashboardDateFilters = {},
) {
  return useQuery({
    queryKey: dashboardKeys.operations(filters),
    queryFn: () => fetchOperationsDashboard(filters),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

