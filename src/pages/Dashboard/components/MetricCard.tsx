import { Skeleton } from "@/components/Skeleton/Skeleton";
import type { ReactNode } from "react";
import styles from "../DashboardPage.module.css";

type MetricCardProps = {
  label: string;
  value?: ReactNode;
  hint?: string;
  icon: ReactNode;
  loading?: boolean;
};

export const MetricCard = ({
  label,
  value,
  hint,
  icon,
  loading,
}: MetricCardProps) => (
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

