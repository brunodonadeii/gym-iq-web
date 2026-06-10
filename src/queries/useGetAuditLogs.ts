import type {
  AuditLog,
  AuditLogApiResponse,
  AuditLogFilters,
} from "@/pages/AuditLogs/types";
import { authFetch } from "@/services/api";
import type { PageRequest, PageResponse } from "@/types/pagination";
import { parseApiResponse } from "@/utils/apiError";
import { buildPaginationParams, DEFAULT_PAGE_SIZE } from "@/utils/pagination";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const isPageResponse = (
  response: AuditLogApiResponse,
): response is PageResponse<AuditLog> =>
  !Array.isArray(response) &&
  typeof response === "object" &&
  response !== null &&
  Array.isArray(response.content);

const paginateLogs = (
  logs: AuditLog[],
  pagination: PageRequest,
): PageResponse<AuditLog> => {
  const size = pagination.size ?? DEFAULT_PAGE_SIZE;
  const page = pagination.page ?? 0;
  const start = page * size;
  const content = logs.slice(start, start + size);
  const totalPages = Math.ceil(logs.length / size);

  return {
    content,
    totalElements: logs.length,
    totalPages,
    size,
    number: page,
    first: page === 0,
    last: totalPages === 0 || page >= totalPages - 1,
  };
};

const normalizeResponse = (
  response: AuditLogApiResponse,
  pagination: PageRequest,
) => (isPageResponse(response) ? response : paginateLogs(response, pagination));

export const toAuditLogDateTime = (
  date: string,
  boundary: "start" | "end",
) => {
  const normalizedDate = date.trim();
  if (!normalizedDate) return undefined;

  return boundary === "start"
    ? `${normalizedDate}T00:00:00`
    : `${normalizedDate}T23:59:59.999999999`;
};

const buildAuditLogsPath = (
  filters: AuditLogFilters,
  pagination: PageRequest,
) => {
  const actorId = filters.actorId.trim();
  const resourceType = filters.resourceType.trim();
  const resourceId = filters.resourceId.trim();
  const action = filters.action.trim();
  const from = filters.from.trim();
  const to = filters.to.trim();

  const query = buildPaginationParams(pagination, {
    actorUserId: actorId || undefined,
    action: action || undefined,
    resourceType: resourceType || undefined,
    resourceId: resourceId || undefined,
    from: toAuditLogDateTime(from, "start"),
    to: toAuditLogDateTime(to, "end"),
  });

  return `audit-logs${query ? `?${query}` : ""}`;
};

async function fetchAuditLogs(
  filters: AuditLogFilters,
  pagination: PageRequest,
): Promise<PageResponse<AuditLog>> {
  const response = await authFetch(buildAuditLogsPath(filters, pagination));
  const data = await parseApiResponse<AuditLogApiResponse>(
    response,
    "Erro ao buscar logs de auditoria",
  );

  return normalizeResponse(data, pagination);
}

export function useGetAuditLogs(
  filters: AuditLogFilters,
  pagination: PageRequest,
) {
  return useQuery({
    queryKey: ["audit-logs", filters, pagination],
    queryFn: () => fetchAuditLogs(filters, pagination),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

