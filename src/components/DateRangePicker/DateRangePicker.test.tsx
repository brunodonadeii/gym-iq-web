import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DateRangePicker } from "./DateRangePicker";

describe("DateRangePicker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 10, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the active preset label and helper text", () => {
    render(
      <DateRangePicker
        id="period"
        label="Período"
        value={{ startDate: "2026-06-01", endDate: "2026-06-10" }}
        helperText="Filtra os dados do dashboard."
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Este mês")).toBeInTheDocument();
    expect(screen.getByText("01/06/2026 - 10/06/2026")).toBeInTheDocument();
    expect(
      screen.getByText("Filtra os dados do dashboard."),
    ).toBeInTheDocument();
  });

  it("applies a preset and closes the panel", async () => {
    const onChange = vi.fn();

    render(
      <DateRangePicker
        id="period"
        label="Período"
        value={{ startDate: "2026-06-01", endDate: "2026-06-10" }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Período/i }));
    fireEvent.click(screen.getByRole("button", { name: "Hoje" }));

    expect(onChange).toHaveBeenCalledWith(
      { startDate: "2026-06-10", endDate: "2026-06-10" },
      "today",
    );

    expect(
      screen.queryByRole("button", { name: "Ontem" }),
    ).not.toBeInTheDocument();
  });

  it("applies a custom range and normalizes reversed dates", async () => {
    const onChange = vi.fn();

    render(
      <DateRangePicker
        id="period"
        label="Período"
        value={{ startDate: "2026-06-09", endDate: "2026-06-10" }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Período/i }));
    fireEvent.click(screen.getByRole("button", { name: "Personalizado" }));

    fireEvent.change(screen.getByLabelText("Início"), {
      target: { value: "2026-06-12" },
    });
    fireEvent.change(screen.getByLabelText("Fim"), {
      target: { value: "2026-06-10" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));

    expect(onChange).toHaveBeenCalledWith(
      { startDate: "2026-06-10", endDate: "2026-06-12" },
      "custom",
    );
  });

  it("closes the panel with Escape without applying changes", async () => {
    const onChange = vi.fn();

    render(
      <DateRangePicker
        id="period"
        label="Período"
        value={{ startDate: "2026-06-09", endDate: "2026-06-10" }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Período/i }));
    expect(screen.getByRole("button", { name: "Hoje" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("button", { name: "Hoje" })).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });
});
