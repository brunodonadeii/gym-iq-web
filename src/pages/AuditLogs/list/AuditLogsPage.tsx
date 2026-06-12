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
import Tooltip from "@mui/material/Tooltip";
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
  from: "",
  to: "",
};

const actionLabelOverrides: Record<string, string> = {
  ACTIVATE_INSTRUCTOR: "Ativação de instrutor",
  ACTIVATE_PLAN: "Ativação de plano",
  ACTIVATE_STUDENT: "Ativação de aluno",
  ACTIVATE_WORKOUT_SHEET: "Ativação de ficha de treino",
  CREATE_ADMIN_USER: "Criação de usuário administrativo",
  CREATE_ENROLLMENT: "Criação de matrícula",
  CREATE_EXERCISE: "Criação de exercício",
  CREATE_INSTRUCTOR: "Criação de instrutor",
  CREATE_PAYMENT: "Criação de pagamento",
  CREATE_PLAN: "Criação de plano",
  CREATE_STUDENT: "Criação de aluno",
  CREATE_WORKOUT_SHEET: "Criação de ficha de treino",
  DEACTIVATE_INSTRUCTOR: "Desativação de instrutor",
  DEACTIVATE_PLAN: "Desativação de plano",
  DEACTIVATE_STUDENT: "Desativação de aluno",
  DEACTIVATE_WORKOUT_SHEET: "Desativação de ficha de treino",
  DELETE_ADMIN_USER: "Exclusão de usuário administrativo",
  DELETE_EXERCISE: "Exclusão de exercício",
  DELETE_INSTRUCTOR: "Exclusão de instrutor",
  DELETE_PLAN: "Exclusão de plano",
  DELETE_STUDENT_PERSONAL_DATA: "Exclusão de dados pessoais do aluno",
  DELETE_WORKOUT_SHEET: "Exclusão de ficha de treino",
  FORGOT_PASSWORD: "Recuperação de senha",
  GENERATE_MONTHLY_PAYMENTS: "Geração de mensalidades",
  GENERATE_RETENTION_ALERTS: "Geração de alertas de retenção",
  LOGIN: "Login",
  PAY_PAYMENT: "Pagamento recebido",
  REFRESH_OVERDUE_PAYMENTS: "Atualização de pagamentos vencidos",
  RENEW_ENROLLMENT: "Renovação de matrícula",
  RESET_PASSWORD: "Redefinição de senha",
  UPDATE_ADMIN_USER: "Atualização de usuário administrativo",
  UPDATE_ENROLLMENT_STATUS: "Atualização de status da matrícula",
  UPDATE_EXERCISE: "Atualização de exercício",
  UPDATE_INSTRUCTOR: "Atualização de instrutor",
  UPDATE_PAYMENT_STATUS: "Atualização de status do pagamento",
  UPDATE_PLAN: "Atualização de plano",
  UPDATE_STUDENT: "Atualização de aluno",
  UPDATE_WORKOUT_SHEET: "Atualização de ficha de treino",
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

const getActionLabel = (log: AuditLog) => {
  const actionLabel = log.actionLabel?.trim();
  if (actionLabel) return actionLabel;

  const action = log.action?.trim();
  if (!action) return "-";

  return actionLabelOverrides[action] ?? action;
};

const getActorLabel = (log: AuditLog) => {
  const actorLabel = log.actorLabel?.trim();

  if (actorLabel) {
    return {
      primary: actorLabel,
      secondary: log.actorRole?.trim() || "",
    };
  }

  if (log.resourceType === "JOB") {
    return {
      primary: "Sistema",
      secondary: "Execução automática",
    };
  }

  if (log.actorUserId || log.actorEmail || log.actorRole) {
    return {
      primary: log.actorEmail?.trim() || "Usuário",
      secondary: log.actorRole?.trim() || "",
    };
  }

  if (log.action === "LOGIN" && log.resourceType === "USER") {
    return {
      primary: "Usuário",
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
  const resourceLabel = log.resourceLabel?.trim();
  if (resourceLabel) return resourceLabel;

  if (log.resourceType === "JOB") {
    return "Rotina automática";
  }

  const resourceType = log.resourceType?.trim();
  if (!resourceType) return "-";

  return resourceTypeLabels[resourceType] ?? resourceType;
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
    ...(filterOptions?.actions ?? []).map((option) => ({
      ...option,
      label: actionLabelOverrides[option.value] ?? option.label,
    })),
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
                  const actionLabel = getActionLabel(log);
                  const resourceLabel = getResourceLabel(
                    log,
                    resourceTypeLabels,
                  );
                  const description = log.description?.trim() || "-";

                  return (
                    <TableRow key={getLogId(log, index)}>
                      <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                      <TableCell>
                        <Tooltip
                          title={actionLabel}
                          arrow
                          slotProps={{
                            tooltip: { className: styles.tooltip },
                            arrow: { className: styles.tooltipArrow },
                          }}
                        >
                          <span className={styles.actionBadge}>
                            <span className={styles.truncatedText}>
                              {actionLabel}
                            </span>
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip
                          title={actor.primary}
                          arrow
                          slotProps={{
                            tooltip: { className: styles.tooltip },
                            arrow: { className: styles.tooltipArrow },
                          }}
                        >
                          <div className={styles.cellStack}>
                            <span className={styles.cellPrimary}>
                              {actor.primary}
                            </span>
                            <span className={styles.cellSecondary}>
                              {actor.secondary || "-"}
                            </span>
                          </div>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip
                          title={resourceLabel}
                          arrow
                          slotProps={{
                            tooltip: { className: styles.tooltip },
                            arrow: { className: styles.tooltipArrow },
                          }}
                        >
                          <span className={styles.truncatedText}>
                            {resourceLabel}
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip
                          title={description}
                          arrow
                          slotProps={{
                            tooltip: { className: styles.tooltip },
                            arrow: { className: styles.tooltipArrow },
                          }}
                        >
                          <div className={styles.cellStack}>
                            <span className={styles.cellSecondary}>
                              {description}
                            </span>
                            {log.ipAddress?.trim() && (
                              <span className={styles.cellSecondary}>
                                IP: {log.ipAddress.trim()}
                              </span>
                            )}
                          </div>
                        </Tooltip>
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
