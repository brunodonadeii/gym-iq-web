import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getApiFieldErrorsSpy,
  getDefaultPathByRoleSpy,
  invalidateSpy,
  loginSpy,
  navigateSpy,
  normalizeApiErrorSpy,
  searchState,
  showApiErrorSpy,
} = vi.hoisted(() => ({
  loginSpy: vi.fn(),
  invalidateSpy: vi.fn(),
  navigateSpy: vi.fn(),
  getApiFieldErrorsSpy: vi.fn(),
  normalizeApiErrorSpy: vi.fn(),
  showApiErrorSpy: vi.fn(),
  getDefaultPathByRoleSpy: vi.fn(),
  searchState: {} as {
    redirect?: string;
    reason?: "session-expired" | "permissions-changed";
  },
}));

vi.mock("@/router", () => ({
  router: {
    invalidate: invalidateSpy,
  },
}));

vi.mock("@/services/auth", () => ({
  login: loginSpy,
}));

vi.mock("@/utils/apiError", () => ({
  getApiFieldErrors: getApiFieldErrorsSpy,
  normalizeApiError: normalizeApiErrorSpy,
  showApiError: showApiErrorSpy,
}));

vi.mock("@/utils/auth", () => ({
  auth: {
    role: "ADMIN",
  },
  getDefaultPathByRole: getDefaultPathByRoleSpy,
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
  useNavigate: () => navigateSpy,
  useSearch: () => searchState,
}));

import { LoginPage } from "./LoginPage";

describe("LoginPage", () => {
  beforeEach(() => {
    loginSpy.mockReset();
    loginSpy.mockResolvedValue({
      token: "token",
      type: "Bearer",
      userId: "1",
      name: "Gym IQ",
      email: "admin@gymiq.com",
      role: "ADMIN",
    });
    invalidateSpy.mockReset();
    invalidateSpy.mockResolvedValue(undefined);
    navigateSpy.mockReset();
    getApiFieldErrorsSpy.mockReset();
    getApiFieldErrorsSpy.mockReturnValue(null);
    normalizeApiErrorSpy.mockReset();
    normalizeApiErrorSpy.mockImplementation((error, fallback) => ({
      error: "Erro",
      message: fallback ?? "Erro",
      details: error,
    }));
    showApiErrorSpy.mockReset();
    getDefaultPathByRoleSpy.mockReset();
    getDefaultPathByRoleSpy.mockReturnValue("/dashboard");
    delete searchState.redirect;
    delete searchState.reason;
  });

  it("renders session and permission warning messages from the route search", () => {
    searchState.reason = "session-expired";
    const { rerender } = render(<LoginPage />);

    expect(
      screen.getByRole("alert", {
        name: "",
      }),
    ).toHaveTextContent("Sua sessão expirou. Entre novamente para continuar.");

    searchState.reason = "permissions-changed";
    rerender(<LoginPage />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Suas permissões foram alteradas. Entre novamente para atualizar seu acesso.",
    );
  });

  it("validates required fields before attempting login", async () => {
    render(<LoginPage />);

    const form = screen.getByRole("button", { name: "Entrar" }).closest("form");
    expect(form).not.toBeNull();

    fireEvent.submit(form as HTMLFormElement);

    expect(await screen.findByText("Informe seu e-mail.")).toBeInTheDocument();
    expect(await screen.findByText("Informe sua senha.")).toBeInTheDocument();
    expect(loginSpy).not.toHaveBeenCalled();
  });

  it("logs in and uses the default path when redirect points to dashboard", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("E-mail"), "admin@gymiq.com");
    await user.type(screen.getByLabelText("Senha"), "123456");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() =>
      expect(loginSpy).toHaveBeenCalledWith({
        email: "admin@gymiq.com",
        password: "123456",
      }),
    );

    expect(invalidateSpy).toHaveBeenCalledTimes(1);
    expect(getDefaultPathByRoleSpy).toHaveBeenCalledWith("ADMIN");
    expect(navigateSpy).toHaveBeenCalledWith({ to: "/dashboard" });
  });

  it("prefers the explicit redirect returned by the route search", async () => {
    const user = userEvent.setup();
    searchState.redirect = "/students";
    render(<LoginPage />);

    await user.type(screen.getByLabelText("E-mail"), "admin@gymiq.com");
    await user.type(screen.getByLabelText("Senha"), "123456");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith({ to: "/students" }));
    expect(getDefaultPathByRoleSpy).not.toHaveBeenCalled();
  });

  it("shows field errors returned by the API without triggering the generic error toast", async () => {
    const user = userEvent.setup();
    const apiError = new Error("Credenciais inválidas");
    loginSpy.mockRejectedValue(apiError);
    getApiFieldErrorsSpy.mockReturnValue({
      email: "E-mail inválido.",
      password: "Senha incorreta.",
    });

    render(<LoginPage />);

    await user.type(screen.getByLabelText("E-mail"), "admin@gymiq.com");
    await user.type(screen.getByLabelText("Senha"), "123456");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("E-mail inválido.")).toBeInTheDocument();
    expect(await screen.findByText("Senha incorreta.")).toBeInTheDocument();
    expect(showApiErrorSpy).not.toHaveBeenCalled();
    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it("normalizes unknown API errors and shows the fallback message", async () => {
    const user = userEvent.setup();
    const apiError = new Error("boom");
    const normalizedError = {
      error: "Erro",
      message:
        "Não foi possível entrar. Confira seu e-mail e senha e tente novamente.",
    };

    loginSpy.mockRejectedValue(apiError);
    normalizeApiErrorSpy.mockReturnValue(normalizedError);

    render(<LoginPage />);

    await user.type(screen.getByLabelText("E-mail"), "admin@gymiq.com");
    await user.type(screen.getByLabelText("Senha"), "123456");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() =>
      expect(normalizeApiErrorSpy).toHaveBeenCalledWith(
        apiError,
        "Não foi possível entrar. Confira seu e-mail e senha e tente novamente.",
      ),
    );

    expect(showApiErrorSpy).toHaveBeenCalledWith(
      normalizedError,
      "Não foi possível entrar. Confira seu e-mail e senha e tente novamente.",
    );
    expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
  });
});
