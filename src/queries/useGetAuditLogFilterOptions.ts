import type { AuditLogFilterOptions } from "@/pages/AuditLogs/types";
import { authFetch } from "@/services/api";
import { parseApiResponse } from "@/utils/apiError";
import { useQuery } from "@tanstack/react-query";

export const auditLogFilterOptionsKeys = {
  all: ["audit-logs", "filter-options"] as const,
};

async function fetchAuditLogFilterOptions(): Promise<AuditLogFilterOptions> {
  const response = await authFetch("audit-logs/filter-options");

  return parseApiResponse(response, "Erro ao buscar filtros de auditoria");
}

export function useGetAuditLogFilterOptions() {
  return useQuery({
    queryKey: auditLogFilterOptionsKeys.all,
    queryFn: fetchAuditLogFilterOptions,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
