import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { formatDateTimeSpy, getErrorMessageSpy } = vi.hoisted(() => ({
  formatDateTimeSpy: vi.fn(),
  getErrorMessageSpy: vi.fn(),
}));

vi.mock("@/components/Skeleton/Skeleton", () => ({
  Skeleton: () => <div data-testid="dashboard-section-skeleton" />,
}));

vi.mock("lucide-react", () => ({
  AlertTriangle: () => <svg data-testid="alert-triangle" />,
}));

vi.mock("../utils", () => ({
  formatDateTime: formatDateTimeSpy,
  getErrorMessage: getErrorMessageSpy,
}));

import { DashboardSection } from "./DashboardSection";

describe("DashboardSection", () => {
  it("renders title, description, generated date and children", () => {
    formatDateTimeSpy.mockReturnValue("10/06/2026, 08:30");

    render(
      <DashboardSection
        title="Retenção"
        description="Indicadores principais"
        generatedAt="2026-06-10T08:30:00Z"
      >
        <div>Conteúdo do bloco</div>
      </DashboardSection>,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Retenção" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Indicadores principais")).toBeInTheDocument();
    expect(screen.getByText("Gerado em 10/06/2026, 08:30")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo do bloco")).toBeInTheDocument();
  });

  it("renders action and skeleton while loading", () => {
    render(
      <DashboardSection
        title="Financeiro"
        description="Resumo"
        loading
        action={<button type="button">Atualizar</button>}
      >
        <div>Conteúdo</div>
      </DashboardSection>,
    );

    expect(screen.getByRole("button", { name: "Atualizar" })).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-section-skeleton")).toBeInTheDocument();
  });

  it("renders the error state instead of children when an error exists", () => {
    getErrorMessageSpy.mockReturnValue("Verifique sua conexão.");

    render(
      <DashboardSection
        title="Operações"
        description="Resumo"
        error={new Error("Falhou")}
      >
        <div>Conteúdo oculto</div>
      </DashboardSection>,
    );

    expect(screen.getByTestId("alert-triangle")).toBeInTheDocument();
    expect(
      screen.getByText("Não foi possível carregar este bloco."),
    ).toBeInTheDocument();
    expect(screen.getByText("Verifique sua conexão.")).toBeInTheDocument();
    expect(screen.queryByText("Conteúdo oculto")).not.toBeInTheDocument();
  });
});
