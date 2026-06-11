import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("lucide-react", () => ({
  ShieldAlert: () => <svg data-testid="shield-alert" />,
}));

import { AccessBlocked } from "./AccessBlocked";

describe("AccessBlocked", () => {
  it("renders the administrator-only access message", () => {
    render(<AccessBlocked />);

    expect(screen.getByTestId("shield-alert")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Dashboard disponível apenas para administradores",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Sua sessão não tem permissão para acessar os indicadores administrativos.",
      ),
    ).toBeInTheDocument();
  });
});
