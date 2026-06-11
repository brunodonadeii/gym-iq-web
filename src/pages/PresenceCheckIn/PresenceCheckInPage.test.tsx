import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getApiFieldErrorsSpy,
  mutateSpy,
  normalizeApiErrorSpy,
  useSelfCheckInSpy,
} = vi.hoisted(() => ({
  getApiFieldErrorsSpy: vi.fn(),
  mutateSpy: vi.fn(),
  normalizeApiErrorSpy: vi.fn(),
  useSelfCheckInSpy: vi.fn(),
}));

vi.mock("@/components/Button/Button", () => ({
  Button: ({
    children,
    disabled,
    loading,
    onClick,
    type,
  }: {
    children: ReactNode;
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
  }) => (
    <button type={type} disabled={disabled || loading} onClick={onClick}>
      {children}
    </button>
  ),
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

vi.mock("@/mutations/useSelfCheckIn", () => ({
  useSelfCheckIn: useSelfCheckInSpy,
}));

vi.mock("@/utils/apiError", () => ({
  getApiFieldErrors: getApiFieldErrorsSpy,
  normalizeApiError: normalizeApiErrorSpy,
}));

vi.mock("lucide-react", () => ({
  AlertCircle: () => <svg />,
  CheckCircle2: () => <svg />,
  LogIn: () => <svg />,
  RotateCcw: () => <svg />,
}));

import { PresenceCheckInPage } from "./PresenceCheckInPage";

describe("PresenceCheckInPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getApiFieldErrorsSpy.mockReturnValue(null);
    normalizeApiErrorSpy.mockReturnValue({
      message: "Não foi possível registrar o check-in.",
    });
    useSelfCheckInSpy.mockReturnValue({
      mutate: mutateSpy,
      isPending: false,
    });
  });

  it("renders the form and disables submit until both fields are filled", () => {
    render(<PresenceCheckInPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Check-in" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Entrar na academia" }),
    ).toBeDisabled();
  });

  it("submits trimmed identifier and default notes", async () => {
    const user = userEvent.setup();
    render(<PresenceCheckInPage />);

    await user.type(screen.getByLabelText("CPF ou e-mail"), " aluno@test.com ");
    await user.type(screen.getByLabelText("Senha"), "123456");
    await user.click(screen.getByRole("button", { name: "Entrar na academia" }));

    expect(mutateSpy).toHaveBeenCalledWith(
      {
        identifier: "aluno@test.com",
        password: "123456",
        notes: "Check-in pelo totem",
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });

  it("renders success state and allows starting a new check-in", async () => {
    const user = userEvent.setup();
    render(<PresenceCheckInPage />);

    await user.type(screen.getByLabelText("CPF ou e-mail"), "aluno@test.com");
    await user.type(screen.getByLabelText("Senha"), "123456");
    await user.click(screen.getByRole("button", { name: "Entrar na academia" }));

    const [, options] = mutateSpy.mock.calls[0];
    act(() => {
      options.onSuccess({
        studentName: "Marina",
        checkInAt: "2026-06-10T08:30:00Z",
      });
    });

    expect(await screen.findByText("Entrada registrada")).toBeInTheDocument();
    expect(screen.getByText(/Marina entrou as/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Novo check-in" }));
    await waitFor(() =>
      expect(screen.queryByText("Entrada registrada")).not.toBeInTheDocument(),
    );
  });

  it("renders field errors returned by the API", async () => {
    const user = userEvent.setup();
    render(<PresenceCheckInPage />);

    await user.type(screen.getByLabelText("CPF ou e-mail"), "teste");
    await user.type(screen.getByLabelText("Senha"), "123456");
    await user.click(screen.getByRole("button", { name: "Entrar na academia" }));

    const [, options] = mutateSpy.mock.calls[0];
    getApiFieldErrorsSpy.mockReturnValue({
      identifier: "Informe um CPF ou e-mail válido.",
      password: "Senha incorreta.",
    });
    act(() => {
      options.onError(new Error("Falhou"));
    });

    expect(await screen.findByText("Informe um CPF ou e-mail válido.")).toBeInTheDocument();
    expect(screen.getByText("Senha incorreta.")).toBeInTheDocument();
  });

  it("renders generic error state when the API error has no field mapping", async () => {
    const user = userEvent.setup();
    render(<PresenceCheckInPage />);

    await user.type(screen.getByLabelText("CPF ou e-mail"), "aluno@test.com");
    await user.type(screen.getByLabelText("Senha"), "123456");
    await user.click(screen.getByRole("button", { name: "Entrar na academia" }));

    const [, options] = mutateSpy.mock.calls[0];
    act(() => {
      options.onError(new Error("Falhou"));
    });

    expect(await screen.findByText("Check-in não registrado")).toBeInTheDocument();
    expect(
      screen.getByText("Não foi possível registrar o check-in."),
    ).toBeInTheDocument();
  });
});
