import { describe, expect, it } from "vitest";

import { validatePlanForm } from "./planValidation";

describe("planValidation", () => {
  it("returns required and range errors for invalid data", () => {
    expect(
      validatePlanForm({
        name: "A",
        description: "",
        monthlyPrice: 0,
        durationMonths: 0,
      }),
    ).toEqual({
      name: "Informe ao menos 2 caracteres.",
      description: "Informe a descrição.",
      monthlyPrice: "Informe um valor entre R$ 0,01 e R$ 500,00.",
      durationMonths: "Informe um número inteiro entre 1 e 24.",
    });
  });

  it("returns max length errors when fields exceed the limits", () => {
    expect(
      validatePlanForm({
        name: "A".repeat(101),
        description: "B".repeat(101),
        monthlyPrice: 600,
        durationMonths: 25,
      }),
    ).toEqual({
      name: "Use no máximo 100 caracteres.",
      description: "Use no máximo 100 caracteres.",
      monthlyPrice: "Informe um valor entre R$ 0,01 e R$ 500,00.",
      durationMonths: "Informe um número inteiro entre 1 e 24.",
    });
  });

  it("returns no errors for valid plan data", () => {
    expect(
      validatePlanForm({
        name: "Plano Premium",
        description: "Plano completo",
        monthlyPrice: 99.9,
        durationMonths: 12,
      }),
    ).toEqual({});
  });
});
