import { render, screen } from "@testing-library/react";
import { useMatches } from "@tanstack/react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Header } from "./Header";

vi.mock("@tanstack/react-router", () => ({
  useMatches: vi.fn(),
}));

const mockedUseMatches = vi.mocked(useMatches);

describe("Header", () => {
  beforeEach(() => {
    mockedUseMatches.mockReset();
  });

  it("renders breadcrumbs and headlines from route matches", () => {
    mockedUseMatches.mockReturnValue([
      {
        pathname: "/students",
        staticData: {
          breadcrumb: "Alunos",
          headline: "Gestão de alunos",
        },
      },
      {
        pathname: "/students/123",
        staticData: {
          breadcrumb: "Detalhes",
          headline: "Dados do aluno",
        },
      },
    ] as ReturnType<typeof useMatches>);

    render(<Header />);

    expect(
      screen.getByText("Página administrativa / Alunos /"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Página administrativa / Detalhes"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Gestão de alunos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Dados do aluno" }),
    ).toBeInTheDocument();
  });

  it("ignores matches without breadcrumb metadata", () => {
    mockedUseMatches.mockReturnValue([
      {
        pathname: "/",
        staticData: {},
      },
      {
        pathname: "/plans",
        staticData: {
          breadcrumb: "Planos",
          headline: "Planos disponíveis",
        },
      },
    ] as ReturnType<typeof useMatches>);

    render(<Header />);

    expect(
      screen.getByRole("heading", { name: "Planos disponíveis" }),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("heading")).toHaveLength(1);
  });

  it("renders an empty header when no route has breadcrumb metadata", () => {
    mockedUseMatches.mockReturnValue([
      {
        pathname: "/",
        staticData: {},
      },
    ] as ReturnType<typeof useMatches>);

    const { container } = render(<Header />);

    expect(container.querySelector("header")).toBeEmptyDOMElement();
  });
});
