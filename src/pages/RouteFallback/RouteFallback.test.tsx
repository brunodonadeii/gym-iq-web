import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { navigateComponentSpy, pathnameState } = vi.hoisted(() => ({
  navigateComponentSpy: vi.fn(),
  pathnameState: {
    pathname: "/unknown",
  },
}));

vi.mock("@/components/Button/Button", () => ({
  Button: ({
    children,
    onClick,
    type,
  }: {
    children: ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
  }) => (
    <button type={type} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    className,
  }: {
    children: ReactNode;
    to: string;
    className?: string;
  }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
  Navigate: (props: { to: string; replace?: boolean }) => {
    navigateComponentSpy(props);
    return <div data-testid="navigate" />;
  },
  useRouterState: ({
    select,
  }: {
    select: (state: { location: { pathname: string } }) => string;
  }) => select({ location: { pathname: pathnameState.pathname } }),
}));

import { GlobalErrorFallback, GlobalNotFoundFallback } from "./RouteFallback";

describe("GlobalErrorFallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the provided error message and reload action", () => {
    const reloadSpy = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { reload: reloadSpy },
    });

    render(
      <GlobalErrorFallback
        error={new Error("Falha ao carregar")}
        reset={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Não foi possível carregar a página",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Falha ao carregar")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(reloadSpy).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("link", { name: "Voltar para o dashboard" }),
    ).toHaveAttribute("href", "/dashboard");
  });

  it("uses the default fallback message for unknown errors", () => {
    render(<GlobalErrorFallback error={new Error("")} reset={vi.fn()} />);

    expect(
      screen.getByText("Não foi possível carregar a página"),
    ).toBeInTheDocument();
  });
});

describe("GlobalNotFoundFallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects nested dashboard routes back to /dashboard", () => {
    pathnameState.pathname = "/dashboard/details";
    render(<GlobalNotFoundFallback />);

    expect(navigateComponentSpy).toHaveBeenCalledWith({
      to: "/dashboard",
      replace: true,
    });
  });

  it("redirects nested audit logs routes back to /audit-logs", () => {
    pathnameState.pathname = "/audit-logs/entry";
    render(<GlobalNotFoundFallback />);

    expect(navigateComponentSpy).toHaveBeenCalledWith({
      to: "/audit-logs",
      replace: true,
    });
  });

  it("renders the not found state for other paths", () => {
    pathnameState.pathname = "/missing-page";
    render(<GlobalNotFoundFallback />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Página não encontrada" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("O endereço acessado não existe ou foi removido."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Voltar para o dashboard" }),
    ).toHaveAttribute("href", "/dashboard");
  });
});
