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
import type { RetentionAlert } from "@/pages/Dashboard/types";
import type { PageResponse } from "@/types/pagination";
import { CheckCircle2 } from "lucide-react";
import { formatNumber } from "../utils";
import { RiskBadge } from "./RiskBadge";
import styles from "../DashboardPage.module.css";

const openAlertsColumns = [
  { width: "34%" },
  { width: "10%" },
  { width: "14%" },
  { width: "16%" },
  { width: "16%" },
  { width: "10%" },
];

type OpenRetentionAlertsTableProps = {
  alerts: RetentionAlert[];
  page?: PageResponse<RetentionAlert>;
  currentPage: number;
  loading?: boolean;
  resolvingAlertId?: string;
  resolving?: boolean;
  onResolve: (alert: RetentionAlert) => void;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
};

export const OpenRetentionAlertsTable = ({
  alerts,
  page,
  currentPage,
  loading,
  resolvingAlertId,
  resolving,
  onResolve,
  onPageChange,
  onSizeChange,
}: OpenRetentionAlertsTableProps) => (
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
