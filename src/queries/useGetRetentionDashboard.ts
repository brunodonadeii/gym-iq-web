import type { RetentionDashboard } from "@/pages/Dashboard/types";
import { authFetch } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { dashboardKeys } from "./dashboardKeys";

async function fetchRetentionDashboard(): Promise<RetentionDashboard> {
  const response = await authFetch("dashboard/retention");

  if (!response.ok) {
    throw new Error("Erro ao buscar dashboard de retenção");
  }

  return response.json();
}

export function useGetRetentionDashboard() {
  return useQuery({
    queryKey: dashboardKeys.retention(),
    queryFn: fetchRetentionDashboard,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
