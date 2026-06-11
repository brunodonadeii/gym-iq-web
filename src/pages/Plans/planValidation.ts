import type { PlanFormData } from "@/pages/Plans/types";

export const PLAN_LIMITS = {
  name: {
    minLength: 2,
    maxLength: 100,
  },
  description: {
    maxLength: 100,
  },
  durationMonths: {
    min: 1,
    max: 24,
  },
  monthlyPrice: {
    min: 0.01,
    max: 500,
  },
} as const;

export type PlanFormErrors = Partial<
  Record<keyof PlanFormData, string>
>;

export const validatePlanForm = (data: PlanFormData): PlanFormErrors => {
  const errors: PlanFormErrors = {};
  const name = data.name.trim();
  const description = data.description.trim();
  const monthlyPrice = Number(data.monthlyPrice);
  const durationMonths = Number(data.durationMonths);

  if (name.length < PLAN_LIMITS.name.minLength) {
    errors.name = `Informe ao menos ${PLAN_LIMITS.name.minLength} caracteres.`;
  } else if (name.length > PLAN_LIMITS.name.maxLength) {
    errors.name = `Use no máximo ${PLAN_LIMITS.name.maxLength} caracteres.`;
  }

  if (!description) {
    errors.description = "Informe a descrição.";
  } else if (description.length > PLAN_LIMITS.description.maxLength) {
    errors.description = `Use no máximo ${PLAN_LIMITS.description.maxLength} caracteres.`;
  }

  if (
    !Number.isFinite(monthlyPrice) ||
    monthlyPrice < PLAN_LIMITS.monthlyPrice.min ||
    monthlyPrice > PLAN_LIMITS.monthlyPrice.max
  ) {
    errors.monthlyPrice = "Informe um valor entre R$ 0,01 e R$ 500,00.";
  }

  if (
    !Number.isInteger(durationMonths) ||
    durationMonths < PLAN_LIMITS.durationMonths.min ||
    durationMonths > PLAN_LIMITS.durationMonths.max
  ) {
    errors.durationMonths = "Informe um número inteiro entre 1 e 24.";
  }

  return errors;
};

