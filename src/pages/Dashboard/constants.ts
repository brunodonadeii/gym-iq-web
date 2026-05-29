import type { RetentionRiskLevel } from "@/pages/Dashboard/types";

export const OPEN_ALERTS_SORT = "riskScore,desc";

export const riskLabels: Record<RetentionRiskLevel, string> = {
  LOW: "Baixo",
  MEDIUM: "Médio",
  HIGH: "Alto",
  CRITICAL: "Crítico",
};

export const riskDescriptions: Record<RetentionRiskLevel, string> = {
  LOW: "Baixo risco de abandono",
  MEDIUM: "Risco médio, vale acompanhar",
  HIGH: "Alto risco, exige contato",
  CRITICAL: "Risco crítico, exige ação imediata",
};

export const chartColors = {
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
