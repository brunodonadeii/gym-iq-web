import { Button } from "@/components/Button/Button";
import { Pagination } from "@/components/Pagination/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableSkeletonRows,
} from "@/components/Table/Table";
import { TextField } from "@/components/TextField/TextField";
import type { AuditLog, AuditLogFilters } from "@/pages/AuditLogs/types";
import { useGetAuditLogs } from "@/queries/useGetAuditLogs";
import { FilterX, Search } from "lucide-react";
import { useState } from "react";
import styles from "./AuditLogsPage.module.css";

const logColumns = [
  { width: "20%" },
  { width: "20%" },
  { width: "20%" },
  { width: "20%" },
  { width: "20%" },
];

const EMPTY_FILTERS: AuditLogFilters = {
  action: "",
  actorId: "",
  resourceType: "",
  resourceId: "",
};

const resourceTypeLabels: Record<string, string> = {
  USER: "Usuário",
  STUDENT: "Aluno",
  INSTRUCTOR: "Instrutor",
  PLAN: "Plano",
  ENROLLMENT: "Matrícula",
  PAYMENT: "Pagamento",
  EXERCISE: "Exercício",
  WORKOUT_SHEET: "Ficha",
  WORKOUT_SHEET_EXERCISE: "Exercício da ficha",
  JOB: "Job do sistema",
};

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

const getLogId = (log: AuditLog, index: number) =>
  String(log.auditLogId ?? `${log.createdAt ?? "log"}-${index}`);

const getActorLabel = (log: AuditLog) => {
  if (log.resourceType === "JOB") {
    return {
      primary: "Sistema",
      secondary: "Execução automática",
    };
  }

  if (log.actorUserId || log.actorEmail || log.actorRole) {
    return {
      primary: log.actorEmail?.trim() || `Usuário #${log.actorUserId ?? "-"}`,
      secondary: [log.actorRole?.trim(), log.actorUserId ? `ID ${log.actorUserId}` : null]
        .filter(Boolean)
        .join(" • "),
    };
  }

  if (log.action === "LOGIN" && log.resourceType === "USER" && log.resourceId) {
    return {
      primary: `Usuário #${log.resourceId}`,
      secondary: "Próprio usuário autenticado",
    };
  }

  return {
    primary: "-",
    secondary: "Sem ator identificado",
  };
};

const getResourceLabel = (log: AuditLog) => {
  if (log.resourceType === "JOB") {
    return "Job do sistema";
  }

  const rawType = log.resourceType?.trim() || "Recurso";
  const type = resourceTypeLabels[rawType] ?? rawType;
  const id = log.resourceId ?? "-";

  return `${type} #${id}`;
};

export const AuditLogsPage = () => {
  const [draftFilters, setDraftFilters] = useState<AuditLogFilters>(EMPTY_FILTERS);
  const [filters, setFilters] = useState<AuditLogFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const { data, isLoading, isFetching } = useGetAuditLogs(filters, {
    page,
    size,
    sort: "createdAt,desc",
  });

  const logs = data?.content ?? [];
  const tableLoading = isLoading || isFetching;

  const handleApplyFilters = () => {
    setFilters({
      action: draftFilters.action.trim(),
      actorId: draftFilters.actorId.trim(),
      resourceType: draftFilters.resourceType.trim(),
      resourceId: draftFilters.resourceId.trim(),
    });
    setPage(0);
  };

  const handleClearFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setPage(0);
  };

  return (
    <div className={styles.page}>
      <section className={styles.topBar}>
        <div className={styles.topBarContent}>
          <strong className={styles.topBarTitle}>Filtros de auditoria</strong>
          <span className={styles.topBarSubtitle}>
            Filtre pelo que aconteceu, por quem executou e qual registro foi afetado.
          </span>
        </div>

        <div className={styles.filters}>
          <TextField
            label="Ação"
            id="auditAction"
            value={draftFilters.action}
            onChange={(event) =>
              setDraftFilters((prev) => ({ ...prev, action: event.target.value }))
            }
            placeholder="LOGIN"
          />
          <TextField
            label="ID de quem executou"
            id="auditActorId"
            value={draftFilters.actorId}
            onChange={(event) =>
              setDraftFilters((prev) => ({ ...prev, actorId: event.target.value }))
            }
            placeholder="1"
          />
          <TextField
            label="Tipo de registro afetado"
            id="auditResourceType"
            value={draftFilters.resourceType}
            onChange={(event) =>
              setDraftFilters((prev) => ({
                ...prev,
                resourceType: event.target.value,
              }))
            }
            placeholder="USER, STUDENT, INSTRUCTOR..."
          />
          <TextField
            label="ID do registro afetado"
            id="auditResourceId"
            value={draftFilters.resourceId}
            onChange={(event) =>
              setDraftFilters((prev) => ({
                ...prev,
                resourceId: event.target.value,
              }))
            }
            placeholder="10"
          />
        </div>

        <div className={styles.actions}>
          <Button
            variant="secondary"
            leftIcon={<FilterX size={18} />}
            onClick={handleClearFilters}
          >
            Limpar
          </Button>
          <Button leftIcon={<Search size={18} />} onClick={handleApplyFilters}>
            Buscar
          </Button>
        </div>
      </section>

      <section className={styles.tableSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Logs de auditoria</h3>
            <p className={styles.sectionDescription}>
              {data?.totalElements ?? 0} registro(s) encontrado(s).
            </p>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <Table columns={logColumns} minWidth="1100px">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Data</TableHeaderCell>
                <TableHeaderCell>Ação</TableHeaderCell>
                <TableHeaderCell>Quem executou</TableHeaderCell>
                <TableHeaderCell>Registro afetado</TableHeaderCell>
                <TableHeaderCell>Descrição</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tableLoading && <TableSkeletonRows columns={5} />}

              {!tableLoading &&
                logs.map((log, index) => {
                  const actor = getActorLabel(log);

                  return (
                    <TableRow key={getLogId(log, index)}>
                      <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                      <TableCell>
                        <span className={styles.actionBadge}>
                          {log.action?.trim() || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className={styles.cellStack}>
                          <span className={styles.cellPrimary}>{actor.primary}</span>
                          <span className={styles.cellSecondary}>
                            {actor.secondary || "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getResourceLabel(log)}</TableCell>
                      <TableCell>
                        <div className={styles.cellStack}>
                          <span className={styles.cellSecondary}>
                            {log.description?.trim() || "-"}
                          </span>
                          {log.ipAddress?.trim() && (
                            <span className={styles.cellSecondary}>
                              IP: {log.ipAddress.trim()}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

              {!tableLoading && logs.length === 0 && (
                <TableEmptyState
                  colSpan={5}
                  message="Nenhum log encontrado para os filtros atuais."
                />
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination
          page={data}
          currentPage={page}
          loading={isFetching}
          onPageChange={setPage}
          onSizeChange={(nextSize) => {
            setSize(nextSize);
            setPage(0);
          }}
        />
      </section>
    </div>
  );
};
