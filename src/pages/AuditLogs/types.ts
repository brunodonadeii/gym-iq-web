import type { PageResponse } from "@/types/pagination";

export type AuditLog = {
  auditLogId?: number;
  actorUserId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  action?: string | null;
  resourceType?: string | null;
  resourceId?: number | string | null;
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
