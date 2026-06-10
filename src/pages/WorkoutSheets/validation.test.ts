import { describe, expect, it } from "vitest";
import { validateWorkoutSheetDateRange } from "./validation";

describe("validateWorkoutSheetDateRange", () => {
  it("accepts an empty or incomplete optional period", () => {
    expect(validateWorkoutSheetDateRange("", "")).toBeUndefined();
    expect(validateWorkoutSheetDateRange("2026-06-10", "")).toBeUndefined();
    expect(validateWorkoutSheetDateRange("", "2026-06-10")).toBeUndefined();
  });

  it("accepts the same date and chronological periods", () => {
    expect(
      validateWorkoutSheetDateRange("2026-06-10", "2026-06-10"),
    ).toBeUndefined();
    expect(
      validateWorkoutSheetDateRange("2026-06-10", "2026-07-10"),
    ).toBeUndefined();
  });

  it("rejects an end date before the start date", () => {
    expect(
      validateWorkoutSheetDateRange("2026-06-10", "2026-06-09"),
    ).toBe("A data final não pode ser anterior à data inicial.");
  });
});
