import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@mui/x-charts", () => ({
  BarChart: () => <div data-testid="bar-chart" />,
  PieChart: () => <div data-testid="pie-chart" />,
}));

vi.mock("./chartConfig", () => ({
  chartSx: {},
  chartTooltipSlotProps: {},
}));

import {
  EnrollmentStatusChart,
  FinancialStatusChart,
  RiskDistributionChart,
} from "./DashboardCharts";

describe("DashboardCharts", () => {
  it("renders risk distribution summary and chart", () => {
    render(
      <RiskDistributionChart
        data={{
          lowRiskStudents: 10,
          mediumRiskStudents: 5,
          highRiskStudents: 3,
          criticalRiskStudents: 2,
        } as never}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 4, name: "Distribuição por risco" }),
    ).toBeInTheDocument();
    expect(screen.getByText("20 aluno(s) avaliados")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("renders financial distribution summary and chart", () => {
    render(
      <FinancialStatusChart
        data={{
          paidAmountCurrentMonth: 1000,
          pendingAmountCurrentMonth: 500,
          overdueAmountCurrentMonth: 250,
        } as never}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 4, name: "Distribuição financeira" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Total analisado:/)).toBeInTheDocument();
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
  });

  it("renders enrollment status summary and chart", () => {
    render(
      <EnrollmentStatusChart
        data={{
          activeEnrollments: 40,
          suspendedEnrollments: 3,
          canceledEnrollments: 7,
        } as never}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 4, name: "Status das matrículas" }),
    ).toBeInTheDocument();
    expect(screen.getByText("50 matrícula(s) no total")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });
});
