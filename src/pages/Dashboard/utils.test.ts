import { describe, expect, it, vi } from "vitest";
import type { WorkoutSheetExercise } from "@/pages/WorkoutSheets/types";

const { normalizeApiErrorSpy } = vi.hoisted(() => ({
  normalizeApiErrorSpy: vi.fn(),
}));

vi.mock("@/utils/apiError", () => ({
  normalizeApiError: normalizeApiErrorSpy,
}));

import {
  formatCurrency,
  formatDateTime,
  formatDecimal,
  formatNumber,
  formatPercent,
  getErrorMessage,
  groupExercisesByTrainingSection,
  hasPositiveValues,
  isForbiddenError,
} from "./utils";

describe("dashboard utils", () => {
  it("formats numbers with pt-BR locale defaults", () => {
    expect(formatNumber(1234)).toBe("1.234");
    expect(formatNumber()).toBe("0");
    expect(formatDecimal(12.34)).toBe("12,3");
    expect(formatCurrency(1234.5)).toContain("1.234,50");
    expect(formatPercent(12.345)).toBe("12,35%");
  });

  it("returns fallback messages for empty or invalid dates", () => {
    expect(formatDateTime()).toBe("Não informado");
    expect(formatDateTime("invalid-date")).toBe("Data invalida");
  });

  it("formats valid date strings to pt-BR date time", () => {
    expect(formatDateTime("2026-06-10T14:30:00Z")).toMatch(
      /\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/,
    );
  });

  it("uses normalized api errors to resolve the message", () => {
    normalizeApiErrorSpy.mockReturnValue({
      message: "Erro customizado",
      status: 500,
    });

    expect(getErrorMessage(new Error("boom"), "Fallback")).toBe(
      "Erro customizado",
    );
    expect(normalizeApiErrorSpy).toHaveBeenCalledWith(
      expect.any(Error),
      "Fallback",
    );
  });

  it("falls back when the normalized message is missing", () => {
    normalizeApiErrorSpy.mockReturnValue({
      message: undefined,
      status: 500,
    });

    expect(getErrorMessage(new Error("boom"), "Fallback")).toBe("Fallback");
  });

  it("detects forbidden api errors", () => {
    normalizeApiErrorSpy.mockReturnValueOnce({
      status: 403,
    });
    normalizeApiErrorSpy.mockReturnValueOnce({
      status: 500,
    });

    expect(isForbiddenError(new Error("forbidden"))).toBe(true);
    expect(isForbiddenError(new Error("other"))).toBe(false);
  });

  it("checks whether at least one value is positive", () => {
    expect(hasPositiveValues([0, -1, 2])).toBe(true);
    expect(hasPositiveValues([0, -1, -2])).toBe(false);
    expect(hasPositiveValues([])).toBe(false);
  });
});

describe("groupExercisesByTrainingSection", () => {
  it("returns an empty list when there are no exercises", () => {
    expect(groupExercisesByTrainingSection()).toEqual([]);
    expect(groupExercisesByTrainingSection([])).toEqual([]);
  });

  it("groups exercises by section, trims names and sorts by execution order", () => {
    const exercises = [
      {
        id: 1,
        trainingSection: " B ",
        executionOrder: 2,
      },
      {
        id: 2,
        trainingSection: "",
        executionOrder: 3,
      },
      {
        id: 3,
        trainingSection: "B",
        executionOrder: 1,
      },
      {
        id: 4,
        trainingSection: "A",
        executionOrder: 4,
      },
    ] as WorkoutSheetExercise[];

    expect(groupExercisesByTrainingSection(exercises)).toEqual([
      {
        section: "B",
        exercises: [exercises[2], exercises[0]],
      },
      {
        section: "Treino",
        exercises: [exercises[1]],
      },
      {
        section: "A",
        exercises: [exercises[3]],
      },
    ]);
  });
});
