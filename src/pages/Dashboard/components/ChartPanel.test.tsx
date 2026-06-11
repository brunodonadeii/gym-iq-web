import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/Skeleton/Skeleton", () => ({
  Skeleton: ({
    width,
    height,
  }: {
    width?: string;
    height?: string;
  }) => <div data-testid="chart-skeleton">{width ?? "auto"}x{height ?? "auto"}</div>,
}));

import { ChartLegend, ChartPanel } from "./ChartPanel";

describe("ChartPanel", () => {
  it("renders title, description, summary, children and legend when data is available", () => {
    render(
      <ChartPanel
        title="Receita mensal"
        description="Comparativo por status"
        summary="R$ 10.000"
        legend={<div>Legenda customizada</div>}
        hasData
      >
        <div>Gráfico</div>
      </ChartPanel>,
    );

    expect(
      screen.getByRole("heading", { level: 4, name: "Receita mensal" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Comparativo por status")).toBeInTheDocument();
    expect(screen.getByText("R$ 10.000")).toBeInTheDocument();
    expect(screen.getByText("Gráfico")).toBeInTheDocument();
    expect(screen.getByText("Legenda customizada")).toBeInTheDocument();
  });

  it("renders skeletons while loading", () => {
    render(
      <ChartPanel
        title="Receita mensal"
        description="Comparativo por status"
        loading
        hasData={false}
      >
        <div>Gráfico</div>
      </ChartPanel>,
    );

    expect(screen.getAllByTestId("chart-skeleton")).toHaveLength(2);
    expect(screen.queryByText("Gráfico")).not.toBeInTheDocument();
  });

  it("renders the empty state when there is no data", () => {
    render(
      <ChartPanel
        title="Receita mensal"
        description="Comparativo por status"
        hasData={false}
      >
        <div>Gráfico</div>
      </ChartPanel>,
    );

    expect(screen.getByText("Nada para exibir ainda")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Assim que a API retornar valores maiores que zero, este gráfico será preenchido automaticamente.",
      ),
    ).toBeInTheDocument();
  });
});

describe("ChartLegend", () => {
  it("renders legend items with default number formatting", () => {
    render(
      <ChartLegend
        items={[
          {
            name: "Pagos",
            value: 1234,
            fill: "#00ff00",
            description: "Pagamentos concluídos",
          },
        ]}
      />,
    );

    expect(screen.getByText("Pagos: 1.234")).toBeInTheDocument();
    expect(screen.getByText("Pagamentos concluídos")).toBeInTheDocument();
  });

  it("supports a custom value formatter", () => {
    render(
      <ChartLegend
        items={[
          {
            name: "Pendentes",
            value: 15,
            fill: "#ffaa00",
            description: "Pagamentos aguardando baixa",
          },
        ]}
        valueFormatter={(value) => `${value}%`}
      />,
    );

    expect(screen.getByText("Pendentes: 15%")).toBeInTheDocument();
  });
});
