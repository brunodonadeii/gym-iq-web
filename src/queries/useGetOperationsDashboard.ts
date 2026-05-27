import type { OperationsDashboard } from "@/pages/Dashboard/types";
import { authFetch } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { dashboardKeys } from "./dashboardKeys";

async function fetchOperationsDashboard(): Promise<OperationsDashboard> {
  const response = await authFetch("dashboard/operations");

  if (!response.ok) {
    throw new Error("Erro ao buscar dashboard operacional");
  }

  return response.json();
}

export function useGetOperationsDashboard() {
  return useQuery({
    queryKey: dashboardKeys.operations(),
    queryFn: fetchOperationsDashboard,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
