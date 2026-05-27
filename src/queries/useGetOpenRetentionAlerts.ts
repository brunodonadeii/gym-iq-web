import type { RetentionAlert } from "@/pages/Dashboard/types";
import { authFetch } from "@/services/api";
import type { PageRequest, PageResponse } from "@/types/pagination";
import { buildPaginationParams } from "@/utils/pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { retentionAlertKeys } from "./dashboardKeys";

const DEFAULT_OPEN_RETENTION_ALERTS_PAGE: PageRequest = {
  page: 0,
  size: 10,
  sort: "riskScore,desc",
};

async function fetchOpenRetentionAlerts(
  pagination: PageRequest,
): Promise<PageResponse<RetentionAlert>> {
  const response = await authFetch(
    `retention-alerts/open?${buildPaginationParams(pagination)}`,
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar alertas de retenção abertos");
  }

  return response.json();
}

export function useGetOpenRetentionAlerts(
  pagination: PageRequest = DEFAULT_OPEN_RETENTION_ALERTS_PAGE,
) {
  return useQuery({
    queryKey: retentionAlertKeys.open(pagination),
    queryFn: () => fetchOpenRetentionAlerts(pagination),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
