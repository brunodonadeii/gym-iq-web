import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LgpdConsent } from "./LgpdConsent";

describe("LgpdConsent", () => {
  it("shows the policy version and effective date", async () => {
    const user = userEvent.setup();
    render(<LgpdConsent checked={false} onChange={vi.fn()} />);

    await user.click(
      screen.getByRole("button", { name: "Política de Privacidade" }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Política de Privacidade — versão 1.0",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Vigente desde 10 de junho de 2026."),
    ).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
