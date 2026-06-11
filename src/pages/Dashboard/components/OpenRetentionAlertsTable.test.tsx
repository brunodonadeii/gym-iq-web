import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

const { formatNumberSpy } = vi.hoisted(() => ({
  formatNumberSpy: vi.fn((value: number) => `fmt:${value}`),
}));

vi.mock("@/components/Pagination/Pagination", () => ({
  Pagination: ({
    currentPage,
    onPageChange,
    onSizeChange,
  }: {
    currentPage: number;
    onPageChange: (page: number) => void;
    onSizeChange: (size: number) => void;
  }) => (
    <div data-testid="pagination">
      <span>Página {currentPage}</span>
      <button type="button" onClick={() => onPageChange(2)}>
        Ir para página 2
      </button>
      <button type="button" onClick={() => onSizeChange(25)}>
        Alterar tamanho
      </button>
    </div>
  ),
}));

vi.mock("@/components/Table/Table", () => ({
  Table: ({ children }: { children: ReactNode }) => <table>{children}</table>,
  TableHead: ({ children }: { children: ReactNode }) => <thead>{children}</thead>,
  TableBody: ({ children }: { children: ReactNode }) => <tbody>{children}</tbody>,
  TableRow: ({ children }: { children: ReactNode }) => <tr>{children}</tr>,
  TableCell: ({ children }: { children: ReactNode }) => <td>{children}</td>,
  TableHeaderCell: ({ children }: { children: ReactNode }) => <th>{children}</th>,
  TableSkeletonRows: () => (
    <tr>
      <td>Linhas de carregamento</td>
    </tr>
  ),
  TableEmptyState: ({ message }: { message: string }) => (
    <tr>
      <td>{message}</td>
    </tr>
  ),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    title,
  }: {
    children: ReactNode;
    title?: string;
  }) => <a title={title}>{children}</a>,
}));

vi.mock("lucide-react", () => ({
  CheckCircle2: () => <svg data-testid="resolve-icon" />,
}));

vi.mock("../utils", () => ({
  formatNumber: formatNumberSpy,
}));

vi.mock("./RiskBadge", () => ({
  RiskBadge: ({ level }: { level: string }) => <span>{level}</span>,
}));

import { OpenRetentionAlertsTable } from "./OpenRetentionAlertsTable";

const alert = {
  retentionAlertId: "1",
  studentId: "9",
  studentName: "Marina",
  studentEmail: "marina@test.com",
  riskScore: 95,
  riskLevel: "CRITICAL",
  inactiveDays: 21,
  overduePayments: 2,
  message: "Aluno em risco",
  status: "OPEN",
  resolvedAt: null,
  createdAt: "2026-06-10T08:00:00Z",
  updatedAt: "2026-06-10T08:00:00Z",
} as never;

describe("OpenRetentionAlertsTable", () => {
  it("renders rows and handles resolve and pagination actions", () => {
    const onResolve = vi.fn();
    const onPageChange = vi.fn();
    const onSizeChange = vi.fn();

    render(
      <OpenRetentionAlertsTable
        alerts={[alert]}
        currentPage={1}
        onResolve={onResolve}
        onPageChange={onPageChange}
        onSizeChange={onSizeChange}
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 4,
        name: "Alunos que precisam de atenção",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Marina")).toBeInTheDocument();
    expect(screen.getByText("fmt:95")).toBeInTheDocument();
    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
    expect(screen.getByText("fmt:21")).toBeInTheDocument();
    expect(screen.getByText("fmt:2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Resolver" }));
    expect(onResolve).toHaveBeenCalledWith(alert);

    fireEvent.click(screen.getByRole("button", { name: "Ir para página 2" }));
    fireEvent.click(screen.getByRole("button", { name: "Alterar tamanho" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(onSizeChange).toHaveBeenCalledWith(25);
  });

  it("renders loading rows", () => {
    render(
      <OpenRetentionAlertsTable
        alerts={[]}
        currentPage={1}
        loading
        onResolve={vi.fn()}
        onPageChange={vi.fn()}
        onSizeChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Linhas de carregamento")).toBeInTheDocument();
  });

  it("renders empty state when there are no alerts", () => {
    render(
      <OpenRetentionAlertsTable
        alerts={[]}
        currentPage={1}
        onResolve={vi.fn()}
        onPageChange={vi.fn()}
        onSizeChange={vi.fn()}
      />,
    );

    expect(
      screen.getByText(
        "Nenhum alerta aberto no momento. A equipe está em dia com a retenção.",
      ),
    ).toBeInTheDocument();
  });

  it("marks the current alert as resolving and disables the action while resolving", () => {
    render(
      <OpenRetentionAlertsTable
        alerts={[alert]}
        currentPage={1}
        resolving
        resolvingAlertId="1"
        onResolve={vi.fn()}
        onPageChange={vi.fn()}
        onSizeChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Resolvendo..." }),
    ).toBeDisabled();
  });
});
