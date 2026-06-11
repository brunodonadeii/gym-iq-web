import { Autocomplete } from "@/components/Autocomplete/Autocomplete";
import { Button } from "@/components/Button/Button";
import { Pagination } from "@/components/Pagination/Pagination";
import { SelectField } from "@/components/SelectField/SelectField";
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
import { useGetAuditLogFilterOptions } from "@/queries/useGetAuditLogFilterOptions";
import { useGetAuditLogs } from "@/queries/useGetAuditLogs";
import { normalizeApiError } from "@/utils/apiError";
import { FilterX, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
  from: "",
  to: "",
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
      secondary: [
        log.actorRole?.trim(),
        log.actorUserId ? `ID ${log.actorUserId}` : null,
      ]
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

const getResourceLabel = (
  log: AuditLog,
  resourceTypeLabels: Record<string, string>,
) => {
  if (log.resourceType === "JOB") {
    return "Job do sistema";
  }

  const rawType = log.resourceType?.trim() || "Recurso";
  const type = resourceTypeLabels[rawType] ?? rawType;
  const id = log.resourceId ?? "-";

  return `${type} #${id}`;
};

export const AuditLogsPage = () => {
  const [draftFilters, setDraftFilters] =
    useState<AuditLogFilters>(EMPTY_FILTERS);
  const [filters, setFilters] = useState<AuditLogFilters>(EMPTY_FILTERS);
  const [actorSearch, setActorSearch] = useState("");
  const [dateRangeError, setDateRangeError] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const { data: filterOptions, isLoading: isLoadingFilterOptions } =
    useGetAuditLogFilterOptions();
  const { data, error, isError, isLoading, isFetching } = useGetAuditLogs(
    filters,
    {
      page,
      size,
      sort: "createdAt,desc",
    },
  );

  const logs = data?.content ?? [];
  const tableLoading = isLoading || isFetching;
  const apiError = useMemo(
    () => (isError ? normalizeApiError(error) : null),
    [error, isError],
  );
  const invalidFilterError = apiError?.status === 400;
  const actionOptions = [
    { label: "Todas", value: "" },
    ...(filterOptions?.actions ?? []),
  ];
  const resourceTypeOptions = [
    { label: "Todos", value: "" },
    ...(filterOptions?.resourceTypes ?? []),
  ];
  const actorOptions = useMemo(() => {
    const normalizedSearch = actorSearch.trim().toLowerCase();

    return (filterOptions?.actors ?? [])
      .filter((actor) => {
        if (!normalizedSearch) return true;

        return [
          actor.label,
          actor.actorEmail,
          actor.actorRole,
          actor.actorUserId,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedSearch),
          );
      })
      .map((actor) => ({
        label: actor.label,
        value: String(actor.actorUserId),
        description: [actor.actorRole, actor.actorEmail]
          .filter(Boolean)
          .join(" • "),
      }));
  }, [actorSearch, filterOptions?.actors]);
  const resourceTypeLabels = useMemo(
    () =>
      Object.fromEntries(
        (filterOptions?.resourceTypes ?? []).map((option) => [
          option.value,
          option.label,
        ]),
      ),
    [filterOptions?.resourceTypes],
  );

  useEffect(() => {
    if (!apiError || !invalidFilterError) return;

    toast.error(
      apiError.message ||
        "Filtro inválido. Confira as opções disponíveis e tente novamente.",
    );
  }, [apiError, invalidFilterError]);

  const handleApplyFilters = () => {
    if (
      draftFilters.from &&
      draftFilters.to &&
      draftFilters.from > draftFilters.to
    ) {
      setDateRangeError("A data inicial não pode ser posterior à data final.");
      document.getElementById("auditFrom")?.focus();
      return;
    }

    setDateRangeError("");
    setFilters({
      action: draftFilters.action.trim(),
      actorId: draftFilters.actorId.trim(),
      resourceType: draftFilters.resourceType.trim(),
      resourceId: draftFilters.resourceId.trim(),
      from: draftFilters.from,
      to: draftFilters.to,
    });
    setPage(0);
  };

  const handleClearFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setActorSearch("");
    setDateRangeError("");
    setPage(0);
  };

  return (
    <div className={styles.page}>
      <section className={styles.topBar}>
        <div className={styles.topBarContent}>
          <strong className={styles.topBarTitle}>Filtros de auditoria</strong>
          <span className={styles.topBarSubtitle}>
            Filtre pelo que aconteceu, por quem executou e qual registro foi
            afetado.
          </span>
        </div>

        <div className={styles.filters}>
          <SelectField
            label="Ação"
            id="auditAction"
            value={draftFilters.action}
            onChange={(event) =>
              setDraftFilters((prev) => ({
                ...prev,
                action: event.target.value,
              }))
            }
            options={actionOptions}
            disabled={isLoadingFilterOptions}
          />
          <Autocomplete
            label="Quem executou"
            id="auditActorId"
            search={actorSearch}
            onSearchChange={(value) => {
              setActorSearch(value);
              setDraftFilters((prev) => ({ ...prev, actorId: "" }));
            }}
            onSelect={(option) => {
              setActorSearch(option.label);
              setDraftFilters((prev) => ({ ...prev, actorId: option.value }));
            }}
            onClear={() => {
              setActorSearch("");
              setDraftFilters((prev) => ({ ...prev, actorId: "" }));
            }}
            options={actorOptions}
            loading={isLoadingFilterOptions}
            placeholder="Busque por usuário, e-mail ou perfil"
            emptyMessage="Nenhum ator encontrado."
          />
          <SelectField
            label="Tipo de registro afetado"
            id="auditResourceType"
            value={draftFilters.resourceType}
            onChange={(event) =>
              setDraftFilters((prev) => ({
                ...prev,
                resourceType: event.target.value,
              }))
            }
            options={resourceTypeOptions}
            disabled={isLoadingFilterOptions}
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
          <TextField
            label="Data inicial"
            id="auditFrom"
            type="date"
            value={draftFilters.from}
            onChange={(event) => {
              setDraftFilters((prev) => ({
                ...prev,
                from: event.target.value,
              }));
              setDateRangeError("");
            }}
            error={dateRangeError || undefined}
            optional
          />
          <TextField
            label="Data final"
            id="auditTo"
            type="date"
            value={draftFilters.to}
            onChange={(event) => {
              setDraftFilters((prev) => ({
                ...prev,
                to: event.target.value,
              }));
              setDateRangeError("");
            }}
            optional
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
                          <span className={styles.cellPrimary}>
                            {actor.primary}
                          </span>
                          <span className={styles.cellSecondary}>
                            {actor.secondary || "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getResourceLabel(log, resourceTypeLabels)}
                      </TableCell>
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
                  message={
                    invalidFilterError
                      ? "Filtro inválido. Use as opções disponíveis nos campos acima e tente novamente."
                      : "Nenhum log encontrado para os filtros atuais."
                  }
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
