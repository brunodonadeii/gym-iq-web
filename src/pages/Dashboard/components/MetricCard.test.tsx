import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../DashboardPage.module.css", () => ({
  default: {
    metricCard: "metric-card",
    metricIcon: "metric-icon",
    metricLabel: "metric-label",
    metricValue: "metric-value",
    metricHint: "metric-hint",
  },
}));

vi.mock("@/components/Skeleton/Skeleton", () => ({
  Skeleton: ({
    width,
    height,
  }: {
    width?: string;
    height?: string;
  }) => (
    <div data-testid="metric-skeleton">
      {width}x{height}
    </div>
  ),
}));

import { MetricCard } from "./MetricCard";

describe("MetricCard", () => {
  it("renders label, value, hint and icon when not loading", () => {
    render(
      <MetricCard
        label="Alunos ativos"
        value="120"
        hint="Atualizado hoje"
        icon={<span data-testid="metric-icon">I</span>}
      />,
    );

    expect(screen.getByText("Alunos ativos")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("Atualizado hoje")).toBeInTheDocument();
    expect(screen.getByTestId("metric-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("metric-skeleton")).not.toBeInTheDocument();
  });

  it("renders the skeleton instead of the value while loading", () => {
    render(
      <MetricCard
        label="Receita"
        value="R$ 1.000,00"
        icon={<span>Icon</span>}
        loading
      />,
    );

    expect(screen.getByText("Receita")).toBeInTheDocument();
    expect(screen.getByTestId("metric-skeleton")).toHaveTextContent("120pxx28px");
    expect(screen.queryByText("R$ 1.000,00")).not.toBeInTheDocument();
  });

  it("supports react nodes as the value content", () => {
    render(
      <MetricCard
        label="Churn"
        value={<span>12%</span> as ReactNode}
        icon={<span>Icon</span>}
      />,
    );

    expect(screen.getByText("12%")).toBeInTheDocument();
  });
});
