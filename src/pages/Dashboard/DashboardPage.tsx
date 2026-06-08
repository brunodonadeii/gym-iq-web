import { DateRangePicker } from "@/components/DateRangePicker/DateRangePicker";
import { AccessBlocked } from "@/pages/Dashboard/components/AccessBlocked";
import {
  EnrollmentStatusChart,
  FinancialStatusChart,
  RiskDistributionChart,
} from "@/pages/Dashboard/components/DashboardCharts";
import { DashboardSection } from "@/pages/Dashboard/components/DashboardSection";
import { MetricCard } from "@/pages/Dashboard/components/MetricCard";
import { OpenRetentionAlertsTable } from "@/pages/Dashboard/components/OpenRetentionAlertsTable";
import { OPEN_ALERTS_SORT } from "@/pages/Dashboard/constants";
import type { RetentionAlert } from "@/pages/Dashboard/types";
import {
  formatCurrency,
  formatDecimal,
  formatNumber,
  formatPercent,
  getErrorMessage,
  isForbiddenError,
} from "@/pages/Dashboard/utils";
import { useGenerateRetentionAlerts } from "@/mutations/useGenerateRetentionAlerts";
import { useResolveRetentionAlert } from "@/mutations/useResolveRetentionAlert";
import { useGetFinancialDashboard } from "@/queries/useGetFinancialDashboard";
import { useGetOpenRetentionAlerts } from "@/queries/useGetOpenRetentionAlerts";
import { useGetOperationsDashboard } from "@/queries/useGetOperationsDashboard";
import {
  isRetentionAlertGenerationFailed,
  isRetentionAlertGenerationFinished,
  isRetentionAlertGenerationRunning,
  useGetRetentionAlertGenerationStatus,
} from "@/queries/useGetRetentionAlertGenerationStatus";
import { useGetRetentionDashboard } from "@/queries/useGetRetentionDashboard";
import { dashboardKeys, retentionAlertKeys } from "@/queries/dashboardKeys";
import { auth } from "@/utils/auth";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Banknote,
  CalendarClock,
  ClipboardList,
  CreditCard,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import styles from "./DashboardPage.module.css";
import {
  getDateRangePresetValue,
  type DateRangePresetKey,
  type DateRangeValue,
} from "@/components/DateRangePicker/dateRangeUtils";

const areDateRangesEqual = (a: DateRangeValue, b: DateRangeValue) =>
  a.startDate === b.startDate && a.endDate === b.endDate;

export const DashboardPage = () => {
  const isAdmin = auth.hasAnyRole(["ADMIN"]);
  const queryClient = useQueryClient();
  const generationWasRequestedRef = useRef(false);
  const generationWasRunningRef = useRef(false);
  const [openAlertsPage, setOpenAlertsPage] = useState(0);
  const [openAlertsSize, setOpenAlertsSize] = useState(10);
  const [{ startDate: financialStartDate, endDate: financialEndDate }, setFinancialRange] =
    useState(() => getDateRangePresetValue("thisMonth"));
  const [{ startDate: operationsStartDate, endDate: operationsEndDate }, setOperationsRange] =
    useState(() => getDateRangePresetValue("thisMonth"));

  const retention = useGetRetentionDashboard(isAdmin);
  const financial = useGetFinancialDashboard(isAdmin, {
    startDate: financialStartDate || undefined,
    endDate: financialEndDate || undefined,
  });
  const operations = useGetOperationsDashboard(isAdmin, {
    startDate: operationsStartDate || undefined,
    endDate: operationsEndDate || undefined,
  });
  const openAlerts = useGetOpenRetentionAlerts(
    {
      page: openAlertsPage,
      size: openAlertsSize,
      sort: OPEN_ALERTS_SORT,
    },
    isAdmin,
  );
  const generationStatus = useGetRetentionAlertGenerationStatus(isAdmin);
  const generateRetentionAlerts = useGenerateRetentionAlerts();
  const resolveAlert = useResolveRetentionAlert();

  const retentionLoading = retention.isLoading || retention.isFetching;
  const financialLoading = financial.isLoading || financial.isFetching;
  const operationsLoading = operations.isLoading || operations.isFetching;
  const openAlertsLoading = openAlerts.isLoading || openAlerts.isFetching;
  const resolvingAlertId = resolveAlert.variables?.id;
  const generationRunning =
    generateRetentionAlerts.isPending ||
    isRetentionAlertGenerationRunning(generationStatus.data);

  useEffect(() => {
    const status = generationStatus.data;
    if (!status) return;

    if (isRetentionAlertGenerationRunning(status)) {
      generationWasRunningRef.current = true;
      return;
    }

    const shouldRefreshAfterGeneration =
      generationWasRunningRef.current || generationWasRequestedRef.current;

    if (!shouldRefreshAfterGeneration) return;

    if (isRetentionAlertGenerationFailed(status)) {
      generationWasRunningRef.current = false;
      generationWasRequestedRef.current = false;
      toast.error(
        status.message || "Não foi possível concluir a análise de retenção.",
      );
      return;
    }

    if (isRetentionAlertGenerationFinished(status)) {
      generationWasRunningRef.current = false;
      generationWasRequestedRef.current = false;
      queryClient.invalidateQueries({ queryKey: dashboardKeys.retention() });
      queryClient.invalidateQueries({ queryKey: retentionAlertKeys.all });
      toast.success("Análise de retenção concluída com sucesso.");
    }
  }, [generationStatus.data, queryClient]);

  const blockedByApi =
    isForbiddenError(retention.error) ||
    isForbiddenError(financial.error) ||
    isForbiddenError(operations.error) ||
    isForbiddenError(openAlerts.error);

  if (!isAdmin || blockedByApi) {
    return <AccessBlocked />;
  }

  const handleResolveAlert = (alert: RetentionAlert) => {
    resolveAlert.mutate(
      { id: String(alert.retentionAlertId) },
      {
        onSuccess: () => {
          toast.success("Alerta resolvido com sucesso.");
        },
        onError: (error) => {
          toast.error(
            getErrorMessage(error, "Não foi possível resolver o alerta."),
          );
        },
      },
    );
  };

  const handleRefreshRetentionAnalysis = () => {
    generateRetentionAlerts.mutate(undefined, {
      onSuccess: () => {
        generationWasRequestedRef.current = true;
        toast.success("Análise de retenção iniciada em segundo plano.");
        generationStatus.refetch();
      },
      onError: (error) => {
        toast.error(
          getErrorMessage(error, "Não foi possível atualizar a análise."),
        );
      },
    });
  };

  const handleFinancialRangeChange = (
    value: DateRangeValue,
    preset: DateRangePresetKey,
  ) => {
    const currentRange = {
      startDate: financialStartDate,
      endDate: financialEndDate,
    };

    setFinancialRange(value);

    if (preset === "thisMonth" && areDateRangesEqual(value, currentRange)) {
      financial.refetch();
    }
  };

  const handleOperationsRangeChange = (
    value: DateRangeValue,
    preset: DateRangePresetKey,
  ) => {
    const currentRange = {
      startDate: operationsStartDate,
      endDate: operationsEndDate,
    };

    setOperationsRange(value);

    if (preset === "thisMonth" && areDateRangesEqual(value, currentRange)) {
      operations.refetch();
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <span className={styles.eyebrow}>Dashboard ADMIN</span>
          <h2 className={styles.title}>Visão geral da academia</h2>
          <p className={styles.subtitle}>
            Acompanhe retenção, finanças e operação em uma leitura única para
            tomada de decisão.
          </p>
        </div>

        <div className={styles.headerAside}>
          <span className={styles.statusPill}>Dados administrativos</span>
          <span className={styles.headerNote}>
            Dashboards carregados em paralelo
          </span>
        </div>
      </div>

      <div className={styles.primaryGrid}>
        <MetricCard
          label="Alunos ativos"
          value={formatNumber(retention.data?.activeStudents)}
          icon={<Users size={18} />}
          loading={retentionLoading}
        />
        <MetricCard
          label="Alertas abertos"
          value={formatNumber(retention.data?.openAlerts)}
          icon={<ShieldAlert size={18} />}
          loading={retentionLoading}
        />
        <MetricCard
          label="Receita prevista"
          value={formatCurrency(financial.data?.projectedRevenueCurrentMonth)}
          icon={<TrendingUp size={18} />}
          loading={financialLoading}
        />
        <MetricCard
          label="Check-ins hoje"
          value={formatNumber(operations.data?.checkInsToday)}
          icon={<UserCheck size={18} />}
          loading={operationsLoading}
        />
      </div>

      <DashboardSection
        title="Retenção"
        description="Saúde da base ativa e sinais de risco de abandono."
        generatedAt={retention.data?.generatedAt}
        loading={retentionLoading}
        error={retention.error}
        action={
          <button
            className={styles.refreshButton}
            type="button"
            disabled={generationRunning}
            onClick={handleRefreshRetentionAnalysis}
          >
            <RefreshCw
              size={15}
              className={
                generationRunning ? styles.spinIcon : undefined
              }
            />
            {generationRunning
              ? "Análise em andamento..."
              : "Atualizar análise"}
          </button>
        }
      >
        <div className={styles.metricGrid}>
          <MetricCard
            label="Alunos ativos"
            value={formatNumber(retention.data?.activeStudents)}
            icon={<Users size={18} />}
            loading={retentionLoading}
          />
          <MetricCard
            label="Alertas abertos"
            value={formatNumber(retention.data?.openAlerts)}
            icon={<ShieldAlert size={18} />}
            loading={retentionLoading}
          />
          <MetricCard
            label="Score médio de risco"
            value={formatDecimal(retention.data?.averageRiskScore)}
            icon={<AlertTriangle size={18} />}
            loading={retentionLoading}
          />
          <MetricCard
            label="Sem check-in há 15+ dias"
            value={formatNumber(
              retention.data?.studentsWithoutCheckInOver15Days,
            )}
            icon={<CalendarClock size={18} />}
            loading={retentionLoading}
          />
          <MetricCard
            label="Com pagamentos atrasados"
            value={formatNumber(retention.data?.studentsWithOverduePayments)}
            icon={<CreditCard size={18} />}
            loading={retentionLoading}
          />
        </div>

        <RiskDistributionChart
          data={retention.data}
          loading={retentionLoading}
        />

        <OpenRetentionAlertsTable
          alerts={openAlerts.data?.content ?? []}
          page={openAlerts.data}
          currentPage={openAlertsPage}
          loading={openAlertsLoading}
          resolving={resolveAlert.isPending}
          resolvingAlertId={resolvingAlertId}
          onResolve={handleResolveAlert}
          onPageChange={setOpenAlertsPage}
          onSizeChange={(nextSize) => {
            setOpenAlertsSize(nextSize);
            setOpenAlertsPage(0);
          }}
        />
      </DashboardSection>

      <DashboardSection
        title="Financeiro"
        description="Receita prevista, pagamentos recebidos e inadimplência do mês."
        generatedAt={financial.data?.generatedAt}
        loading={financialLoading}
        error={financial.error}
        action={
          <div className={styles.sectionFilters}>
            <DateRangePicker
              id="financialDateRange"
              label="Período"
              value={{
                startDate: financialStartDate,
                endDate: financialEndDate,
              }}
              onChange={handleFinancialRangeChange}
              className={styles.sectionFilterField}
            />
          </div>
        }
      >
        <div className={styles.metricGrid}>
          <MetricCard
            label="Receita prevista"
            value={formatCurrency(financial.data?.projectedRevenueCurrentMonth)}
            icon={<TrendingUp size={18} />}
            loading={financialLoading}
          />
          <MetricCard
            label="Valor pago"
            value={formatCurrency(financial.data?.paidAmountCurrentMonth)}
            hint={`${formatNumber(financial.data?.paidPaymentsCurrentMonth)} pagamento(s)`}
            icon={<Banknote size={18} />}
            loading={financialLoading}
          />
          <MetricCard
            label="Valor pendente"
            value={formatCurrency(financial.data?.pendingAmountCurrentMonth)}
            hint={`${formatNumber(financial.data?.pendingPaymentsCurrentMonth)} pagamento(s)`}
            icon={<ClipboardList size={18} />}
            loading={financialLoading}
          />
          <MetricCard
            label="Valor atrasado"
            value={formatCurrency(financial.data?.overdueAmountCurrentMonth)}
            hint={`${formatNumber(financial.data?.overduePaymentsCurrentMonth)} pagamento(s)`}
            icon={<AlertTriangle size={18} />}
            loading={financialLoading}
          />
          <MetricCard
            label="Taxa de inadimplência"
            value={formatPercent(financial.data?.defaultRate)}
            icon={<CreditCard size={18} />}
            loading={financialLoading}
          />
        </div>

        <FinancialStatusChart
          data={financial.data}
          loading={financialLoading}
        />
      </DashboardSection>

      <DashboardSection
        title="Operacional"
        description="Movimento do dia, matrículas e crescimento do mês."
        generatedAt={operations.data?.generatedAt}
        loading={operationsLoading}
        error={operations.error}
        action={
          <div className={styles.sectionFilters}>
            <DateRangePicker
              id="operationsDateRange"
              label="Período"
              value={{
                startDate: operationsStartDate,
                endDate: operationsEndDate,
              }}
              onChange={handleOperationsRangeChange}
              className={styles.sectionFilterField}
            />
          </div>
        }
      >
        <div className={styles.metricGrid}>
          <MetricCard
            label="Check-ins hoje"
            value={formatNumber(operations.data?.checkInsToday)}
            icon={<UserCheck size={18} />}
            loading={operationsLoading}
          />
          <MetricCard
            label="Clientes no início"
            value={formatNumber(operations.data?.activeCustomersAtPeriodStart)}
            icon={<Users size={18} />}
            loading={operationsLoading}
          />
          <MetricCard
            label="Clientes perdidos"
            value={formatNumber(operations.data?.lostCustomersInPeriod)}
            icon={<AlertTriangle size={18} />}
            loading={operationsLoading}
          />
          <MetricCard
            label="Churn rate"
            value={formatPercent(operations.data?.churnRate)}
            icon={<TrendingUp size={18} />}
            loading={operationsLoading}
          />
          <MetricCard
            label="Matrículas ativas"
            value={formatNumber(operations.data?.activeEnrollments)}
            icon={<ClipboardList size={18} />}
            loading={operationsLoading}
          />
          <MetricCard
            label="Matrículas suspensas"
            value={formatNumber(operations.data?.suspendedEnrollments)}
            icon={<AlertTriangle size={18} />}
            loading={operationsLoading}
          />
          <MetricCard
            label="Matrículas canceladas"
            value={formatNumber(operations.data?.canceledEnrollments)}
            icon={<ShieldAlert size={18} />}
            loading={operationsLoading}
          />
          <MetricCard
            label="Vencendo em 7 dias"
            value={formatNumber(
              operations.data?.enrollmentsExpiringInNext7Days,
            )}
            icon={<CalendarClock size={18} />}
            loading={operationsLoading}
          />
          <MetricCard
            label="Novos alunos no mês"
            value={formatNumber(operations.data?.newStudentsCurrentMonth)}
            icon={<Users size={18} />}
            loading={operationsLoading}
          />
        </div>

        <EnrollmentStatusChart
          data={operations.data}
          loading={operationsLoading}
        />
      </DashboardSection>
    </div>
  );
};


