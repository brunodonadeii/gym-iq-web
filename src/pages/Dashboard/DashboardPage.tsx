import { Skeleton } from "@/components/Skeleton/Skeleton";
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
  RetentionAlert,
  RetentionAlertStatus,
  RetentionRiskLevel,
} from "@/pages/Dashboard/types";
import { useGetFinancialDashboard } from "@/queries/useGetFinancialDashboard";
import { useGetOperationsDashboard } from "@/queries/useGetOperationsDashboard";
import { useGetRetentionDashboard } from "@/queries/useGetRetentionDashboard";
import { DashboardRequestError } from "@/queries/dashboardError";
import { auth } from "@/utils/auth";
import {
  AlertTriangle,
  Banknote,
  CalendarClock,
  ClipboardList,
  CreditCard,
  ShieldAlert,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
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
  children: ReactNode;
};

const riskLabels: Record<RetentionRiskLevel, string> = {
  LOW: "Baixo",
  MEDIUM: "Médio",
  HIGH: "Alto",
  CRITICAL: "Crítico",
};

const alertStatusLabels: Record<RetentionAlertStatus, string> = {
  OPEN: "Aberto",
  RESOLVED: "Resolvido",
};

const riskRankingColumns = [
  { width: "28%" },
  { width: "12%" },
  { width: "14%" },
  { width: "16%" },
  { width: "18%" },
  { width: "12%" },
];

const formatNumber = (value?: number) =>
  new Intl.NumberFormat("pt-BR").format(value ?? 0);

const formatCurrency = (value?: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value ?? 0);

const formatPercent = (value?: number) =>
  `${new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  }).format(value ?? 0)}%`;

const formatDateTime = (value?: string) =>
  value
    ? new Date(value).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Não informado";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof DashboardRequestError) {
    return error.mensagem ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const isForbiddenError = (error: unknown) =>
  error instanceof DashboardRequestError && error.status === 403;

const RiskBadge = ({ level }: { level: RetentionRiskLevel }) => (
  <span className={`${styles.badge} ${styles[`risk${level}`]}`}>
    {riskLabels[level] ?? level}
  </span>
);

const StatusBadge = ({ status }: { status: RetentionAlertStatus }) => (
  <span className={`${styles.badge} ${styles[`status${status}`]}`}>
    {alertStatusLabels[status] ?? status}
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
  children,
}: DashboardSectionProps) => (
  <section className={styles.section}>
    <div className={styles.sectionHeader}>
      <div>
        <h3 className={styles.sectionTitle}>{title}</h3>
        <p className={styles.sectionDescription}>{description}</p>
      </div>
      <div className={styles.generatedAt}>
        {loading ? (
          <Skeleton width="160px" height="16px" />
        ) : (
          `Gerado em ${formatDateTime(generatedAt)}`
        )}
      </div>
    </div>

    {error ? (
      <div className={styles.errorState}>
        <AlertTriangle size={18} />
        <span>
          {getErrorMessage(error, "Não foi possível carregar este bloco.")}
        </span>
      </div>
    ) : (
      children
    )}
  </section>
);

const RiskRankingTable = ({
  alerts,
  loading,
}: {
  alerts: RetentionAlert[];
  loading?: boolean;
}) => (
  <div className={styles.rankingBlock}>
    <div>
      <h4 className={styles.subsectionTitle}>Ranking de risco</h4>
      <p className={styles.subsectionDescription}>
        Alunos com maior probabilidade de abandono segundo a análise atual.
      </p>
    </div>

    <Table columns={riskRankingColumns} minWidth="920px">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Aluno</TableHeaderCell>
          <TableHeaderCell center>Score</TableHeaderCell>
          <TableHeaderCell center>Nível</TableHeaderCell>
          <TableHeaderCell center>Dias sem check-in</TableHeaderCell>
          <TableHeaderCell center>Pagamentos atrasados</TableHeaderCell>
          <TableHeaderCell center>Status</TableHeaderCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {loading && <TableSkeletonRows columns={6} rows={4} />}

        {!loading &&
          alerts.map((alert) => (
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
                <StatusBadge status={alert.status} />
              </TableCell>
            </TableRow>
          ))}

        {!loading && alerts.length === 0 && (
          <TableEmptyState
            colSpan={6}
            message="Nenhum aluno em risco retornado pela análise."
          />
        )}
      </TableBody>
    </Table>
  </div>
);

const AccessBlocked = () => (
  <section className={styles.blockedState}>
    <ShieldAlert size={28} />
    <div>
      <h2>Dashboard disponível apenas para administradores</h2>
      <p>
        Sua sessão não tem permissão para acessar os indicadores administrativos.
      </p>
    </div>
  </section>
);

export const DashboardPage = () => {
  const isAdmin = auth.hasAnyRole(["ADMIN"]);
  const retention = useGetRetentionDashboard(isAdmin);
  const financial = useGetFinancialDashboard(isAdmin);
  const operations = useGetOperationsDashboard(isAdmin);

  const blockedByApi =
    isForbiddenError(retention.error) ||
    isForbiddenError(financial.error) ||
    isForbiddenError(operations.error);

  if (!isAdmin || blockedByApi) {
    return <AccessBlocked />;
  }

  const retentionLoading = retention.isLoading || retention.isFetching;
  const financialLoading = financial.isLoading || financial.isFetching;
  const operationsLoading = operations.isLoading || operations.isFetching;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>Dashboard ADMIN</span>
          <h2 className={styles.title}>Visão geral da academia</h2>
          <p className={styles.subtitle}>
            Indicadores de retenção, finanças e operação carregados em paralelo.
          </p>
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
            value={formatNumber(retention.data?.averageRiskScore)}
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

        <RiskRankingTable
          alerts={retention.data?.topRiskStudents ?? []}
          loading={retentionLoading}
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
            label="Valor pago"
            value={formatCurrency(financial.data?.paidAmountCurrentMonth)}
            icon={<Banknote size={18} />}
            loading={financialLoading}
          />
          <MetricCard
            label="Valor pendente"
            value={formatCurrency(financial.data?.pendingAmountCurrentMonth)}
            icon={<ClipboardList size={18} />}
            loading={financialLoading}
          />
          <MetricCard
            label="Valor atrasado"
            value={formatCurrency(financial.data?.overdueAmountCurrentMonth)}
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
            label="Check-ins abertos"
            value={formatNumber(operations.data?.openCheckIns)}
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
            value={formatNumber(operations.data?.enrollmentsExpiringInNext7Days)}
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
      </DashboardSection>
    </div>
  );
};
