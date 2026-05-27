import type { PageRequest } from "@/types/pagination";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  retention: () => [...dashboardKeys.all, "retention"] as const,
  financial: () => [...dashboardKeys.all, "financial"] as const,
  operations: () => [...dashboardKeys.all, "operations"] as const,
};

export const retentionAlertKeys = {
  all: ["retention-alerts"] as const,
  open: (pagination?: PageRequest) =>
    pagination
      ? ([...retentionAlertKeys.all, "open", pagination] as const)
      : ([...retentionAlertKeys.all, "open"] as const),
};
