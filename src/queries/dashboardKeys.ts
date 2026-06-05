import type { PageRequest } from "@/types/pagination";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  retention: () => [...dashboardKeys.all, "retention"] as const,
  financial: (filters?: { startDate?: string; endDate?: string }) =>
    [...dashboardKeys.all, "financial", filters] as const,
  operations: (filters?: { startDate?: string; endDate?: string }) =>
    [...dashboardKeys.all, "operations", filters] as const,
};

export const retentionAlertKeys = {
  all: ["retention-alerts"] as const,
  open: (pagination?: PageRequest) =>
    pagination
      ? ([...retentionAlertKeys.all, "open", pagination] as const)
      : ([...retentionAlertKeys.all, "open"] as const),
};

