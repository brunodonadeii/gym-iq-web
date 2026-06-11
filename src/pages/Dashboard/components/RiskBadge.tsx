import type { RetentionRiskLevel } from "@/pages/Dashboard/types";
import { riskDescriptions, riskLabels } from "../constants";
import styles from "../DashboardPage.module.css";

export const RiskBadge = ({ level }: { level: RetentionRiskLevel }) => (
  <span
    className={`${styles.badge} ${styles[`risk${level}`]}`}
    title={riskDescriptions[level] ?? level}
  >
    {riskLabels[level] ?? level}
  </span>
);

