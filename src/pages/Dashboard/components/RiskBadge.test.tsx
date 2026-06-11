import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../DashboardPage.module.css", () => ({
  default: {
    badge: "badge",
    riskLOW: "risk-low",
    riskMEDIUM: "risk-medium",
    riskHIGH: "risk-high",
    riskCRITICAL: "risk-critical",
  },
}));

import { RiskBadge } from "./RiskBadge";

describe("RiskBadge", () => {
  it("renders the localized label and description for the provided level", () => {
    render(<RiskBadge level="HIGH" />);

    const badge = screen.getByText("Alto");

    expect(badge).toHaveAttribute("title", "Alto risco, exige contato");
    expect(badge).toHaveClass("badge", "risk-high");
  });

  it("renders each known level with its corresponding label", () => {
    const cases = [
      { level: "LOW", label: "Baixo" },
      { level: "MEDIUM", label: "Médio" },
      { level: "HIGH", label: "Alto" },
      { level: "CRITICAL", label: "Crítico" },
    ] as const;

    cases.forEach(({ level, label }) => {
      const { unmount } = render(<RiskBadge level={level} />);

      expect(screen.getByText(label)).toBeInTheDocument();

      unmount();
    });
  });
});
