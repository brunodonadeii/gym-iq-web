import { Skeleton } from "@/components/Skeleton/Skeleton";
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
import type {
  FinancialDashboard,
  OperationsDashboard,
  RetentionAlert,
  RetentionDashboard,
  RetentionRiskLevel,
} from "@/pages/Dashboard/types";
import type { PageResponse } from "@/types/pagination";
import { useGetFinancialDashboard } from "@/queries/useGetFinancialDashboard";
import { useGetOperationsDashboard } from "@/queries/useGetOperationsDashboard";
import { useGetOpenRetentionAlerts } from "@/queries/useGetOpenRetentionAlerts";
import { useGetRetentionDashboard } from "@/queries/useGetRetentionDashboard";
import { useGenerateRetentionAlerts } from "@/mutations/useGenerateRetentionAlerts";
import { useResolveRetentionAlert } from "@/mutations/useResolveRetentionAlert";
import { DashboardRequestError } from "@/queries/dashboardError";
import { auth } from "@/utils/auth";
import {
  AlertTriangle,
  Banknote,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { BarChart, PieChart } from "@mui/x-charts";
import { toast } from "sonner";
import styles from "./DashboardPage.module.css";

type MetricCardProps = {
  label: string;
  value?: ReactNode;
  hint?: string;
  icon: ReactNode;
  loading?: boolean;
};

type DashboardSectionProps = {
  title: string;
  description: string;
  generatedAt?: string;
  loading?: boolean;
  error?: unknown;
  action?: ReactNode;
  children: ReactNode;
};

const riskLabels: Record<RetentionRiskLevel, string> = {
  LOW: "Baixo",
  MEDIUM: "Médio",
  HIGH: "Alto",
  CRITICAL: "Crítico",
};

const riskDescriptions: Record<RetentionRiskLevel, string> = {
  LOW: "Baixo risco de abandono",
  MEDIUM: "Risco médio, vale acompanhar",
  HIGH: "Alto risco, exige contato",
  CRITICAL: "Risco crítico, exige ação imediata",
};

const openAlertsColumns = [
  { width: "34%" },
  { width: "10%" },
  { width: "14%" },
  { width: "16%" },
  { width: "16%" },
  { width: "10%" },
];

const OPEN_ALERTS_SORT = "riskScore,desc";

const chartColors = {
  low: "#64748b",
  medium: "#b45309",
  high: "#c2410c",
  critical: "#b91c1c",
  paid: "#ff8a3d",
  pending: "#b45309",
  overdue: "#b91c1c",
  active: "#ff8a3d",
  suspended: "#b45309",
  canceled: "#b91c1c",
};

const numberFormatter = new Intl.NumberFormat("pt-BR");

const decimalFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2,
});

const chartTooltipSlotProps = {
  tooltip: {
    trigger: "item" as const,
    anchor: "node" as const,
    position: "top" as const,
  },
};

const formatNumber = (value?: number) => numberFormatter.format(value ?? 0);

const formatDecimal = (value?: number) => decimalFormatter.format(value ?? 0);

const formatCurrency = (value?: number) => currencyFormatter.format(value ?? 0);

const formatPercent = (value?: number) =>
  `${percentFormatter.format(value ?? 0)}%`;

const formatDateTime = (value?: string) => {
  if (!value) {
    return "Não informado";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data inválida";
  }

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof DashboardRequestError) {
    return error.mensagem ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const apiError = error as {
      mensagem?: string;
      message?: string;
      erro?: string;
    };

    return apiError.mensagem ?? apiError.message ?? apiError.erro ?? fallback;
  }

  return fallback;
};

const isForbiddenError = (error: unknown) =>
  error instanceof DashboardRequestError && error.status === 403;

const hasPositiveValues = (values: number[]) =>
  values.some((value) => value > 0);

const RiskBadge = ({ level }: { level: RetentionRiskLevel }) => (
  <span
    className={`${styles.badge} ${styles[`risk${level}`]}`}
    title={riskDescriptions[level] ?? level}
  >
    {riskLabels[level] ?? level}
  </span>
);

const MetricCard = ({ label, value, hint, icon, loading }: MetricCardProps) => (
  <article className={styles.metricCard}>
    <div className={styles.metricIcon}>{icon}</div>
    <div>
      <span className={styles.metricLabel}>{label}</span>
      {loading ? (
        <Skeleton width="120px" height="28px" />
      ) : (
        <strong className={styles.metricValue}>{value}</strong>
      )}
      {hint && <span className={styles.metricHint}>{hint}</span>}
    </div>
  </article>
);

const DashboardSection = ({
  title,
  description,
  generatedAt,
  loading,
  error,
  action,
  children,
}: DashboardSectionProps) => (
  <section className={styles.section}>
    <div className={styles.sectionHeader}>
      <div>
        <h3 className={styles.sectionTitle}>{title}</h3>
        <p className={styles.sectionDescription}>{description}</p>
      </div>
      <div className={styles.sectionMeta}>
        {action}
        <div className={styles.generatedAt}>
          {loading ? (
            <Skeleton width="160px" height="16px" />
          ) : (
            `Gerado em ${formatDateTime(generatedAt)}`
          )}
        </div>
      </div>
    </div>

    {error ? (
      <div className={styles.errorState}>
        <AlertTriangle size={18} />
        <div>
          <strong>Não foi possível carregar este bloco.</strong>
          <span>
            {getErrorMessage(
              error,
              "Tente atualizar a página ou verificar sua conexão.",
            )}
          </span>
        </div>
      </div>
    ) : (
      children
    )}
  </section>
);

const ChartPanel = ({
  title,
  description,
  summary,
  legend,
  loading,
  hasData,
  children,
}: {
  title: string;
  description: string;
  summary?: string;
  legend?: ReactNode;
  loading?: boolean;
  hasData: boolean;
  children: ReactNode;
}) => (
  <div className={styles.chartPanel}>
    <div className={styles.chartHeader}>
      <div>
        <h4 className={styles.subsectionTitle}>{title}</h4>
        <p className={styles.subsectionDescription}>{description}</p>
      </div>
      {summary && <span className={styles.chartSummary}>{summary}</span>}
    </div>
    {loading ? (
      <div className={styles.chartSkeleton}>
        <Skeleton height="210px" radius="18px" />
        <Skeleton width="70%" height="16px" />
      </div>
    ) : hasData ? (
      <div className={styles.chartFrame}>
        {children}
        {legend}
      </div>
    ) : (
      <div className={styles.emptyChart}>
        <strong>Nada para exibir ainda</strong>
        <span>
          Assim que a API retornar valores maiores que zero, este gráfico será
          preenchido automaticamente.
        </span>
      </div>
    )}
  </div>
);

const ChartLegend = ({
  items,
  valueFormatter = formatNumber,
}: {
  items: Array<{
    name: string;
    value: number;
    fill: string;
    description: string;
  }>;
  valueFormatter?: (value: number) => string;
}) => (
  <div className={styles.chartLegend}>
    {items.map((item) => (
      <div className={styles.chartLegendItem} key={item.name}>
        <span
          className={styles.legendDot}
          style={{ backgroundColor: item.fill }}
        />
        <div>
          <strong>
            {item.name}: {valueFormatter(item.value)}
          </strong>
          <span>{item.description}</span>
        </div>
      </div>
    ))}
  </div>
);

const RiskDistributionChart = ({
  data,
  loading,
}: {
  data?: RetentionDashboard;
  loading?: boolean;
}) => {
  const chartData = [
    {
      name: "Baixo",
      value: data?.lowRiskStudents ?? 0,
      fill: chartColors.low,
      description: "Alunos com poucos sinais de abandono.",
    },
    {
      name: "Médio",
      value: data?.mediumRiskStudents ?? 0,
      fill: chartColors.medium,
      description: "Alunos que merecem acompanhamento preventivo.",
    },
    {
      name: "Alto",
      value: data?.highRiskStudents ?? 0,
      fill: chartColors.high,
      description: "Alunos com sinais fortes de evasão.",
    },
    {
      name: "Crítico",
      value: data?.criticalRiskStudents ?? 0,
      fill: chartColors.critical,
      description: "Alunos que precisam de ação imediata.",
    },
  ];
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <ChartPanel
      title="Distribuição por risco"
      description="Quantidade de alunos em cada nível de risco de retenção."
      summary={`${formatNumber(total)} aluno(s) avaliados`}
      loading={loading}
      hasData={hasPositiveValues(chartData.map((item) => item.value))}
      legend={<ChartLegend items={chartData} />}
    >
      <BarChart
        height={260}
        hideLegend
        xAxis={[
          {
            data: chartData.map((item) => item.name),
            scaleType: "band",
            colorMap: {
              type: "ordinal",
              values: chartData.map((item) => item.name),
              colors: chartData.map((item) => item.fill),
            },
          },
        ]}
        yAxis={[{ min: 0 }]}
        series={[
          {
            label: "Alunos",
            data: chartData.map((item) => item.value),
            valueFormatter: (value) => formatNumber(value ?? 0),
          },
        ]}
        margin={{ top: 16, right: 16, bottom: 34, left: 38 }}
        slotProps={chartTooltipSlotProps}
      />
    </ChartPanel>
  );
};

const FinancialStatusChart = ({
  data,
  loading,
}: {
  data?: FinancialDashboard;
  loading?: boolean;
}) => {
  const chartData = [
    {
      name: "Pago",
      value: data?.paidAmountCurrentMonth ?? 0,
      fill: chartColors.paid,
      description: "Valor já recebido no mês atual.",
    },
    {
      name: "Pendente",
      value: data?.pendingAmountCurrentMonth ?? 0,
      fill: chartColors.pending,
      description: "Valor previsto que ainda não foi pago.",
    },
    {
      name: "Atrasado",
      value: data?.overdueAmountCurrentMonth ?? 0,
      fill: chartColors.overdue,
      description: "Valor vencido no mês atual.",
    },
  ];
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <ChartPanel
      title="Distribuição financeira"
      description="Comparação entre valores pagos, pendentes e atrasados."
      summary={`Total analisado: ${formatCurrency(total)}`}
      loading={loading}
      hasData={hasPositiveValues(chartData.map((item) => item.value))}
      legend={<ChartLegend items={chartData} valueFormatter={formatCurrency} />}
    >
      <PieChart
        height={260}
        hideLegend
        series={[
          {
            data: chartData.map((item) => ({
              id: item.name,
              value: item.value,
              label: item.name,
              color: item.fill,
            })),
            innerRadius: 58,
            outerRadius: 92,
            paddingAngle: 3,
            valueFormatter: (item) => formatCurrency(item.value),
          },
        ]}
        slotProps={chartTooltipSlotProps}
      />
    </ChartPanel>
  );
};

const EnrollmentStatusChart = ({
  data,
  loading,
}: {
  data?: OperationsDashboard;
  loading?: boolean;
}) => {
  const chartData = [
    {
      name: "Ativas",
      value: data?.activeEnrollments ?? 0,
      fill: chartColors.active,
      description: "Matrículas em uso no momento.",
    },
    {
      name: "Suspensas",
      value: data?.suspendedEnrollments ?? 0,
      fill: chartColors.suspended,
      description: "Matrículas temporariamente pausadas.",
    },
    {
      name: "Canceladas",
      value: data?.canceledEnrollments ?? 0,
      fill: chartColors.canceled,
      description: "Matrículas encerradas.",
    },
  ];
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <ChartPanel
      title="Status das matrículas"
      description="Distribuição atual das matrículas por status operacional."
      summary={`${formatNumber(total)} matrícula(s) no total`}
      loading={loading}
      hasData={hasPositiveValues(chartData.map((item) => item.value))}
      legend={<ChartLegend items={chartData} />}
    >
      <BarChart
        height={260}
        hideLegend
        xAxis={[
          {
            data: chartData.map((item) => item.name),
            scaleType: "band",
            colorMap: {
              type: "ordinal",
              values: chartData.map((item) => item.name),
              colors: chartData.map((item) => item.fill),
            },
          },
        ]}
        yAxis={[{ min: 0 }]}
        series={[
          {
            label: "Matrículas",
            data: chartData.map((item) => item.value),
            valueFormatter: (value) => formatNumber(value ?? 0),
          },
        ]}
        margin={{ top: 16, right: 16, bottom: 34, left: 38 }}
        slotProps={chartTooltipSlotProps}
      />
    </ChartPanel>
  );
};

const OpenRetentionAlertsTable = ({
  alerts,
  page,
  currentPage,
  loading,
  resolvingAlertId,
  resolving,
  onResolve,
  onPageChange,
  onSizeChange,
}: {
  alerts: RetentionAlert[];
  page?: PageResponse<RetentionAlert>;
  currentPage: number;
  loading?: boolean;
  resolvingAlertId?: string;
  resolving?: boolean;
  onResolve: (alert: RetentionAlert) => void;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
}) => (
  <div className={styles.rankingBlock}>
    <div>
      <h4 className={styles.subsectionTitle}>Alunos que precisam de atenção</h4>
      <p className={styles.subsectionDescription}>
        Prioridade de contato baseada em risco, ausência de check-in e
        pagamentos atrasados.
      </p>
    </div>

    <Table columns={openAlertsColumns} minWidth="920px">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Aluno</TableHeaderCell>
          <TableHeaderCell center>Score</TableHeaderCell>
          <TableHeaderCell center>Nível</TableHeaderCell>
          <TableHeaderCell center>Dias sem check-in</TableHeaderCell>
          <TableHeaderCell center>Pagamentos atrasados</TableHeaderCell>
          <TableHeaderCell center>Resolver</TableHeaderCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {loading && <TableSkeletonRows columns={6} rows={5} />}

        {!loading &&
          alerts.map((alert) => {
            const alertId = String(alert.retentionAlertId);
            const isCurrentAlertResolving =
              resolving && resolvingAlertId === alertId;

            return (
              <TableRow key={alert.retentionAlertId}>
                <TableCell>
                  <div className={styles.nameCell}>
                    <span className={styles.namePrimary}>
                      {alert.studentName}
                    </span>
                    <span className={styles.nameSecondary}>
                      {alert.studentEmail}
                    </span>
                  </div>
                </TableCell>
                <TableCell center>{formatNumber(alert.riskScore)}</TableCell>
                <TableCell center>
                  <RiskBadge level={alert.riskLevel} />
                </TableCell>
                <TableCell center>{formatNumber(alert.inactiveDays)}</TableCell>
                <TableCell center>
                  {formatNumber(alert.overduePayments)}
                </TableCell>
                <TableCell center>
                  <button
                    className={styles.resolveButton}
                    type="button"
                    disabled={resolving}
                    onClick={() => onResolve(alert)}
                  >
                    <CheckCircle2 size={14} />
                    {isCurrentAlertResolving ? "Resolvendo..." : "Resolver"}
                  </button>
                </TableCell>
              </TableRow>
            );
          })}

        {!loading && alerts.length === 0 && (
          <TableEmptyState
            colSpan={6}
            message="Nenhum alerta aberto no momento. A equipe está em dia com a retenção."
          />
        )}
      </TableBody>
    </Table>

    <Pagination
      page={page}
      currentPage={currentPage}
      loading={loading}
      onPageChange={onPageChange}
      onSizeChange={onSizeChange}
    />
  </div>
);

const AccessBlocked = () => (
  <section className={styles.blockedState}>
    <ShieldAlert size={28} />
    <div>
      <h2>Dashboard disponível apenas para administradores</h2>
      <p>
        Sua sessão não tem permissão para acessar os indicadores
        administrativos.
      </p>
    </div>
  </section>
);

export const DashboardPage = () => {
  const isAdmin = auth.hasAnyRole(["ADMIN"]);
  const [openAlertsPage, setOpenAlertsPage] = useState(0);
  const [openAlertsSize, setOpenAlertsSize] = useState(10);
  const retention = useGetRetentionDashboard(isAdmin);
  const financial = useGetFinancialDashboard(isAdmin);
  const operations = useGetOperationsDashboard(isAdmin);
  const openAlerts = useGetOpenRetentionAlerts(
    {
      page: openAlertsPage,
      size: openAlertsSize,
      sort: OPEN_ALERTS_SORT,
    },
    isAdmin,
  );
  const generateRetentionAlerts = useGenerateRetentionAlerts();
  const resolveAlert = useResolveRetentionAlert();

  const blockedByApi =
    isForbiddenError(retention.error) ||
    isForbiddenError(financial.error) ||
    isForbiddenError(operations.error) ||
    isForbiddenError(openAlerts.error);

  if (!isAdmin || blockedByApi) {
    return <AccessBlocked />;
  }

  const retentionLoading = retention.isLoading || retention.isFetching;
  const financialLoading = financial.isLoading || financial.isFetching;
  const operationsLoading = operations.isLoading || operations.isFetching;
  const openAlertsLoading = openAlerts.isLoading || openAlerts.isFetching;
  const resolvingAlertId = resolveAlert.variables?.id;

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
        toast.success("Análise de retenção atualizada com sucesso.");
      },
      onError: (error) => {
        toast.error(
          getErrorMessage(error, "Não foi possível atualizar a análise."),
        );
      },
    });
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
            disabled={generateRetentionAlerts.isPending}
            onClick={handleRefreshRetentionAnalysis}
          >
            <RefreshCw
              size={15}
              className={
                generateRetentionAlerts.isPending ? styles.spinIcon : undefined
              }
            />
            {generateRetentionAlerts.isPending
              ? "Atualizando..."
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
      >
        <div className={styles.metricGrid}>
          <MetricCard
            label="Check-ins hoje"
            value={formatNumber(operations.data?.checkInsToday)}
            icon={<UserCheck size={18} />}
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
