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
  low: "var(--chart-low)",
  medium: "var(--chart-medium)",
  high: "var(--chart-high)",
  critical: "var(--chart-critical)",
  paid: "var(--chart-paid)",
  pending: "var(--chart-pending)",
  overdue: "var(--chart-overdue)",
  active: "var(--chart-active)",
  suspended: "var(--chart-suspended)",
  canceled: "var(--chart-canceled)",
};


