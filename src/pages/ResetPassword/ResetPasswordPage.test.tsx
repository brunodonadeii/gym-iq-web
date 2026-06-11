import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getApiFieldErrorsSpy,
  normalizeApiErrorSpy,
  resetPasswordSpy,
  searchState,
  showApiErrorSpy,
} = vi.hoisted(() => ({
  getApiFieldErrorsSpy: vi.fn(),
  normalizeApiErrorSpy: vi.fn(),
  resetPasswordSpy: vi.fn(),
  searchState: {} as { token?: string },
  showApiErrorSpy: vi.fn(),
}));

vi.mock("@/components/Button/Button", () => ({
  Button: ({
    children,
    disabled,
    loading,
    type,
  }: {
    children: ReactNode;
    disabled?: boolean;
    loading?: boolean;
    type?: "button" | "submit" | "reset";
  }) => (
    <button type={type} disabled={disabled || loading}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/Card/Card", () => ({
  Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/TextField/TextField", () => ({
  TextField: ({
    label,
    value,
    onChange,
    error,
    id,
    disabled,
    type,
  }: {
    label: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    id: string;
    disabled?: boolean;
    type?: string;
  }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} value={value} onChange={onChange} disabled={disabled} />
      {error ? <span>{error}</span> : null}
    </div>
  ),
}));

vi.mock("@/services/auth", () => ({
  resetPassword: resetPasswordSpy,
}));

vi.mock("@/utils/apiError", () => ({
  getApiFieldErrors: getApiFieldErrorsSpy,
  normalizeApiError: normalizeApiErrorSpy,
  showApiError: showApiErrorSpy,
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useSearch: () => searchState,
}));

import { ResetPasswordPage } from "./ResetPasswordPage";

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchState.token = " token-123 ";
    getApiFieldErrorsSpy.mockReturnValue(null);
    normalizeApiErrorSpy.mockReturnValue({
      message: "Não foi possível redefinir a senha.",
    });
  });

  it("shows invalid-link state when the token is missing", () => {
    searchState.token = undefined;
    render(<ResetPasswordPage />);

    expect(
      screen.getByRole("heading", { level: 3, name: "Link de redefinição inválido" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Solicite um novo link de recuperação de senha.",
    );
    expect(
      screen.getByRole("button", { name: "Salvar nova senha" }),
    ).toBeDisabled();
  });

  it("validates password length and confirmation", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordPage />);

    await user.type(screen.getByLabelText("Nova senha"), "123");
    await user.type(screen.getByLabelText("Confirmar nova senha"), "456");
    fireEvent.submit(screen.getByRole("button", { name: "Salvar nova senha" }).closest("form")!);

    expect(
      await screen.findByText("Use pelo menos 6 caracteres na nova senha."),
    ).toBeInTheDocument();
    expect(screen.getByText("As senhas não coincidem.")).toBeInTheDocument();
    expect(resetPasswordSpy).not.toHaveBeenCalled();
  });

  it("submits the token and shows the success message", async () => {
    const user = userEvent.setup();
    resetPasswordSpy.mockResolvedValue({
      message: "Senha redefinida com sucesso",
    });

    render(<ResetPasswordPage />);

    await user.type(screen.getByLabelText("Nova senha"), "123456");
    await user.type(screen.getByLabelText("Confirmar nova senha"), "123456");
    await user.click(screen.getByRole("button", { name: "Salvar nova senha" }));

    await waitFor(() =>
      expect(resetPasswordSpy).toHaveBeenCalledWith({
        token: "token-123",
        newPassword: "123456",
      }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Senha redefinida com sucesso",
    );
  });

  it("maps field errors returned by the API", async () => {
    const user = userEvent.setup();
    const error = new Error("Falhou");
    resetPasswordSpy.mockRejectedValue(error);
    getApiFieldErrorsSpy.mockReturnValue({
      password: "Senha inválida.",
      confirmPassword: "Confirmação inválida.",
    });

    render(<ResetPasswordPage />);

    await user.type(screen.getByLabelText("Nova senha"), "123456");
    await user.type(screen.getByLabelText("Confirmar nova senha"), "123456");
    await user.click(screen.getByRole("button", { name: "Salvar nova senha" }));

    expect(await screen.findByText("Senha inválida.")).toBeInTheDocument();
    expect(screen.getByText("Confirmação inválida.")).toBeInTheDocument();
    expect(showApiErrorSpy).not.toHaveBeenCalled();
  });

  it("normalizes and shows generic API errors", async () => {
    const user = userEvent.setup();
    const error = new Error("Falhou");
    const normalized = {
      message: "Não foi possível redefinir a senha.",
    };
    resetPasswordSpy.mockRejectedValue(error);
    normalizeApiErrorSpy.mockReturnValue(normalized);

    render(<ResetPasswordPage />);

    await user.type(screen.getByLabelText("Nova senha"), "123456");
    await user.type(screen.getByLabelText("Confirmar nova senha"), "123456");
    await user.click(screen.getByRole("button", { name: "Salvar nova senha" }));

    await waitFor(() =>
      expect(showApiErrorSpy).toHaveBeenCalledWith(
        normalized,
        "Não foi possível redefinir a senha.",
      ),
    );
  });
});
