import type { FinancialDashboard } from "@/pages/Dashboard/types";
import { authFetch } from "@/services/api";
import { parseApiResponse } from "@/utils/apiError";
import { buildPaginationParams } from "@/utils/pagination";
import { useQuery } from "@tanstack/react-query";
import { dashboardKeys } from "./dashboardKeys";

type DashboardDateFilters = {
  startDate?: string;
  endDate?: string;
};

async function fetchFinancialDashboard(
  filters: DashboardDateFilters,
): Promise<FinancialDashboard> {
  const query = buildPaginationParams(
    {},
    {
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    },
  );
  const response = await authFetch(
    `dashboard/financial${query ? `?${query}` : ""}`,
  );

  return parseApiResponse(response, "Erro ao buscar dashboard financeiro");
}

export function useGetFinancialDashboard(
  enabled = true,
  filters: DashboardDateFilters = {},
) {
  return useQuery({
    queryKey: dashboardKeys.financial(filters),
    queryFn: () => fetchFinancialDashboard(filters),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

