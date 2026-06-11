import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  forgotPasswordSpy,
  getApiFieldErrorsSpy,
  normalizeApiErrorSpy,
  showApiErrorSpy,
  toastSuccessSpy,
} = vi.hoisted(() => ({
  forgotPasswordSpy: vi.fn(),
  getApiFieldErrorsSpy: vi.fn(),
  normalizeApiErrorSpy: vi.fn(),
  showApiErrorSpy: vi.fn(),
  toastSuccessSpy: vi.fn(),
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
  }: {
    label: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    id: string;
    disabled?: boolean;
  }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} value={value} onChange={onChange} disabled={disabled} />
      {error ? <span>{error}</span> : null}
    </div>
  ),
}));

vi.mock("@/services/auth", () => ({
  forgotPassword: forgotPasswordSpy,
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
}));

vi.mock("sonner", () => ({
  toast: {
    success: toastSuccessSpy,
  },
}));

import { ForgotPasswordPage } from "./ForgotPasswordPage";

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getApiFieldErrorsSpy.mockReturnValue(null);
    normalizeApiErrorSpy.mockReturnValue({
      message: "Não foi possível solicitar a redefinição de senha.",
    });
  });

  it("renders the recovery screen and submit action", () => {
    render(<ForgotPasswordPage />);

    expect(
      screen.getByRole("heading", { level: 3, name: "Esqueci minha senha" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Enviar link" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("link", { name: "Voltar para login" }),
    ).toHaveAttribute("href", "/login");
  });

  it("submits the trimmed e-mail and shows success toast", async () => {
    const user = userEvent.setup();
    forgotPasswordSpy.mockResolvedValue({
      message: "Link enviado com sucesso",
    });

    render(<ForgotPasswordPage />);

    await user.type(screen.getByLabelText("E-mail"), " aluno@test.com ");
    await user.click(screen.getByRole("button", { name: "Enviar link" }));

    await waitFor(() =>
      expect(forgotPasswordSpy).toHaveBeenCalledWith({
        email: "aluno@test.com",
      }),
    );
    expect(toastSuccessSpy).toHaveBeenCalledWith("Link enviado com sucesso");
  });

  it("renders field error returned by the API", async () => {
    const user = userEvent.setup();
    const error = new Error("Falhou");
    forgotPasswordSpy.mockRejectedValue(error);
    getApiFieldErrorsSpy.mockReturnValue({
      email: "Informe um e-mail válido.",
    });

    render(<ForgotPasswordPage />);

    await user.type(screen.getByLabelText("E-mail"), "teste");
    await user.click(screen.getByRole("button", { name: "Enviar link" }));

    expect(await screen.findByText("Informe um e-mail válido.")).toBeInTheDocument();
    expect(showApiErrorSpy).not.toHaveBeenCalled();
  });

  it("normalizes and shows generic API errors", async () => {
    const user = userEvent.setup();
    const error = new Error("Falhou");
    const normalized = {
      message: "Não foi possível solicitar a redefinição de senha.",
    };
    forgotPasswordSpy.mockRejectedValue(error);
    normalizeApiErrorSpy.mockReturnValue(normalized);

    render(<ForgotPasswordPage />);

    await user.type(screen.getByLabelText("E-mail"), "aluno@test.com");
    fireEvent.submit(screen.getByRole("button", { name: "Enviar link" }).closest("form")!);

    await waitFor(() =>
      expect(showApiErrorSpy).toHaveBeenCalledWith(
        normalized,
        "Não foi possível solicitar a redefinição de senha.",
      ),
    );
  });
});
