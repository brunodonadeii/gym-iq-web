import type { PageResponse } from "@/types/pagination";

export type AuditLog = {
  auditLogId?: number;
  actorUserId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  action?: string | null;
  resourceType?: string | null;
  resourceId?: string | null;
  description?: string | null;
  ipAddress?: string | null;
  createdAt?: string | null;
};

export type AuditLogFilters = {
  action: string;
  actorId: string;
  resourceType: string;
  resourceId: string;
};

export type AuditLogApiResponse = AuditLog[] | PageResponse<AuditLog>;

export type AuditLogFilterOption = {
  value: string;
  label: string;
};

export type AuditLogActorFilterOption = {
  actorUserId: string;
  actorEmail?: string | null;
  actorRole?: string | null;
  label: string;
};

export type AuditLogFilterOptions = {
  actions: AuditLogFilterOption[];
  resourceTypes: AuditLogFilterOption[];
  actors: AuditLogActorFilterOption[];
};

