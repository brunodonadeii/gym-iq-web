import { describe, expect, it } from "vitest";

import type { WorkoutSheetExercise } from "@/pages/WorkoutSheets/types";
import {
  formatCurrency,
  formatEnrollmentEndDate,
  formatExerciseMeta,
  formatDateTime,
  formatDateTimeAsDate,
  getEnrollmentStatusClassName,
  getPaymentStatusClassName,
  groupExercisesByTrainingSection,
  isRecurringEnrollment,
} from "./utils";

describe("student portal utils", () => {
  const styles = {
    badge: "badge",
    successBadge: "success",
    dangerBadge: "danger",
    warningBadge: "warning",
  };

  it("formats date time values and returns a fallback for missing values", () => {
    expect(formatDateTimeAsDate()).toBe("Não informado");
    expect(formatDateTime()).toBe("Não informado");
    expect(formatDateTimeAsDate("2026-06-10T14:30:00Z")).toMatch(
      /\d{2}\/\d{2}\/\d{4}/,
    );
    expect(formatDateTime("2026-06-10T14:30:00Z")).toMatch(
      /\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/,
    );
  });

  it("formats currencies with pt-BR locale", () => {
    expect(formatCurrency(1234.5)).toContain("1.234,50");
    expect(formatCurrency()).toContain("0,00");
  });

  it("detects recurring enrollments and formats end dates", () => {
    expect(isRecurringEnrollment()).toBe(true);
    expect(isRecurringEnrollment(null)).toBe(true);
    expect(isRecurringEnrollment("")).toBe(true);
    expect(isRecurringEnrollment("2026-06-10")).toBe(false);

    expect(formatEnrollmentEndDate()).toBe("Matrícula recorrente");
    expect(formatEnrollmentEndDate("2026-06-10")).toBe("10/06/2026");
  });

  it("builds exercise metadata from the available fields", () => {
    expect(formatExerciseMeta()).toBe("");
    expect(formatExerciseMeta(3)).toBe("3 séries");
    expect(formatExerciseMeta(3, "12")).toBe("3 séries | 12 repetições");
    expect(formatExerciseMeta(3, "12", 45)).toBe(
      "3 séries | 12 repetições | 45s descanso",
    );
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
    ] as unknown as WorkoutSheetExercise[];

    expect(groupExercisesByTrainingSection()).toEqual([]);
    expect(groupExercisesByTrainingSection([])).toEqual([]);
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

  it("maps payment statuses to the expected badge classes", () => {
    expect(getPaymentStatusClassName("PAID", styles)).toBe("badge success");
    expect(getPaymentStatusClassName("OVERDUE", styles)).toBe("badge danger");
    expect(getPaymentStatusClassName("CANCELED", styles)).toBe("badge danger");
    expect(getPaymentStatusClassName("PENDING", styles)).toBe("badge warning");
  });

  it("maps enrollment statuses to the expected badge classes", () => {
    expect(getEnrollmentStatusClassName("ACTIVE", styles)).toBe(
      "badge success",
    );
    expect(getEnrollmentStatusClassName("CANCELED", styles)).toBe(
      "badge danger",
    );
    expect(getEnrollmentStatusClassName("SUSPENDED", styles)).toBe(
      "badge warning",
    );
    expect(getEnrollmentStatusClassName(undefined, styles)).toBe(
      "badge warning",
    );
  });
});
