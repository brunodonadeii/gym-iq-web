import type { FinancialDashboard } from "@/pages/Dashboard/types";
import { authFetch } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { dashboardKeys } from "./dashboardKeys";

async function fetchFinancialDashboard(): Promise<FinancialDashboard> {
  const response = await authFetch("dashboard/financial");

  if (!response.ok) {
    throw new Error("Erro ao buscar dashboard financeiro");
  }

  return response.json();
}

export function useGetFinancialDashboard() {
  return useQuery({
    queryKey: dashboardKeys.financial(),
    queryFn: fetchFinancialDashboard,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
