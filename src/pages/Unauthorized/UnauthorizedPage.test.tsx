import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  clearAuthStorageSpy,
  getDefaultPathByRoleSpy,
  navigateSpy,
  hasAnyRoleSpy,
} = vi.hoisted(() => ({
  clearAuthStorageSpy: vi.fn(),
  getDefaultPathByRoleSpy: vi.fn(),
  navigateSpy: vi.fn(),
  hasAnyRoleSpy: vi.fn(),
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

vi.mock("@/utils/auth", () => ({
  auth: {
    role: "ADMIN",
    hasAnyRole: hasAnyRoleSpy,
  },
  clearAuthStorage: clearAuthStorageSpy,
  getDefaultPathByRole: getDefaultPathByRoleSpy,
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigateSpy,
}));

import { UnauthorizedPage } from "./UnauthorizedPage";

describe("UnauthorizedPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDefaultPathByRoleSpy.mockReturnValue("/dashboard");
  });

  it("renders the unauthorized message", () => {
    render(<UnauthorizedPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Acesso não permitido" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Seu usuário não tem permissão para acessar esta área do sistema.",
      ),
    ).toBeInTheDocument();
  });

  it("returns to the default role route for admin or reception users", () => {
    hasAnyRoleSpy.mockReturnValue(true);
    render(<UnauthorizedPage />);

    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));

    expect(hasAnyRoleSpy).toHaveBeenCalledWith(["ADMIN", "RECEPTION"]);
    expect(getDefaultPathByRoleSpy).toHaveBeenCalledWith("ADMIN");
    expect(navigateSpy).toHaveBeenCalledWith({ to: "/dashboard" });
    expect(clearAuthStorageSpy).not.toHaveBeenCalled();
  });

  it("clears auth state and redirects to login for users without access", () => {
    hasAnyRoleSpy.mockReturnValue(false);
    render(<UnauthorizedPage />);

    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));

    expect(clearAuthStorageSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith({ to: "/login" });
  });
});
