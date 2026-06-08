import { retentionAlertKeys } from "@/queries/dashboardKeys";
import { authFetch } from "@/services/api";
import { parseApiResponse } from "@/utils/apiError";
import { useQuery } from "@tanstack/react-query";

export type RetentionAlertGenerationStatus = {
  status?: string;
  state?: string;
  phase?: string;
  running?: boolean;
  inProgress?: boolean;
  processing?: boolean;
  completed?: boolean;
  finished?: boolean;
  done?: boolean;
  failed?: boolean;
  error?: string;
  message?: string;
  startedAt?: string;
  finishedAt?: string;
  generatedAt?: string;
};

const RUNNING_STATUSES = new Set([
  "RUNNING",
  "IN_PROGRESS",
  "PROCESSING",
  "STARTED",
  "PENDING",
]);

const FINISHED_STATUSES = new Set([
  "COMPLETED",
  "DONE",
  "FINISHED",
  "SUCCESS",
  "IDLE",
  "NOT_RUNNING",
]);

const FAILED_STATUSES = new Set(["FAILED", "ERROR", "CANCELED", "CANCELLED"]);

const getStatusValue = (status?: RetentionAlertGenerationStatus | null) =>
  String(status?.status ?? status?.state ?? status?.phase ?? "").toUpperCase();

export const isRetentionAlertGenerationRunning = (
  status?: RetentionAlertGenerationStatus | null,
) =>
  Boolean(status?.running || status?.inProgress || status?.processing) ||
  RUNNING_STATUSES.has(getStatusValue(status));

export const isRetentionAlertGenerationFinished = (
  status?: RetentionAlertGenerationStatus | null,
) =>
  !isRetentionAlertGenerationRunning(status) &&
  (Boolean(status?.completed || status?.finished || status?.done) ||
    FINISHED_STATUSES.has(getStatusValue(status)));

export const isRetentionAlertGenerationFailed = (
  status?: RetentionAlertGenerationStatus | null,
) => Boolean(status?.failed || status?.error) || FAILED_STATUSES.has(getStatusValue(status));

async function fetchRetentionAlertGenerationStatus() {
  const response = await authFetch(
    "retention-alerts/generate-active-students/status",
  );

  return parseApiResponse<RetentionAlertGenerationStatus>(
    response,
    "Erro ao buscar status da análise de retenção",
  );
}

export function useGetRetentionAlertGenerationStatus(enabled = true) {
  return useQuery({
    queryKey: retentionAlertKeys.generationStatus(),
    queryFn: fetchRetentionAlertGenerationStatus,
    enabled,
    refetchInterval: (query) =>
      isRetentionAlertGenerationRunning(query.state.data) ? 3000 : false,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
