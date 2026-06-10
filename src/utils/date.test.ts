import { describe, expect, it } from "vitest";
import { formatLocalDate, isLocalDateBeforeToday } from "./date";

describe("formatLocalDate", () => {
  it("formats API LocalDate values without applying a timezone", () => {
    expect(formatLocalDate("2026-06-09")).toBe("09/06/2026");
  });

  it("returns the configured fallback for absent or non-LocalDate values", () => {
    expect(formatLocalDate(null)).toBe("Não informado");
    expect(formatLocalDate("", "-")).toBe("-");
    expect(formatLocalDate("2026-06-09T01:32:54", "-")).toBe("-");
  });

  it("only considers dates before the local calendar day overdue", () => {
    const today = new Date(2026, 5, 10, 12);

    expect(isLocalDateBeforeToday("2026-06-09", today)).toBe(true);
    expect(isLocalDateBeforeToday("2026-06-10", today)).toBe(false);
    expect(isLocalDateBeforeToday("2026-06-11", today)).toBe(false);
  });
});
