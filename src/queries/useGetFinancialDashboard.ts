import type { FinancialDashboard } from "@/pages/Dashboard/types";
import { authFetch } from "@/services/api";
import { parseApiResponse } from "@/utils/apiError";
import { useQuery } from "@tanstack/react-query";
import { dashboardKeys } from "./dashboardKeys";

async function fetchFinancialDashboard(): Promise<FinancialDashboard> {
  const response = await authFetch("dashboard/financial");

  return parseApiResponse(response, "Erro ao buscar dashboard financeiro");
}

export function useGetFinancialDashboard(enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.financial(),
    queryFn: fetchFinancialDashboard,
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
