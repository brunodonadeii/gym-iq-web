import { Button } from "@/components/Button/Button";
import { Form } from "@/components/Form/Form";
import { TextField } from "@/components/TextField/TextField";
import { useFormInputs } from "@/hooks/useFormInputs";
import { useCreatePlan } from "@/mutations/useCreatePlan";
import {
  PLAN_LIMITS,
  type PlanFormErrors,
  validatePlanForm,
} from "@/pages/Plans/planValidation";
import type { PlanFormData } from "@/pages/Plans/types";
import { formatCurrencyInput, parseCurrencyInput } from "@/utils/currency";
import { getApiFieldErrors } from "@/utils/apiError";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import styles from "./PlansCreate.module.css";

const EMPTY_FORM: PlanFormData = {
  name: "",
  description: "",
  durationMonths: 1,
  monthlyPrice: 0,
};

const PLAN_FIELDS = [
  "name",
  "description",
  "durationMonths",
  "monthlyPrice",
] as const;

export const PlansCreate = () => {
  const [data, setData] = useState<PlanFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<PlanFormErrors>({});
  const { set } = useFormInputs(setData);
  const { mutate, isPending } = useCreatePlan();
  const navigate = useNavigate();

  const validate = () => {
    const nextErrors = validatePlanForm(data);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    mutate(
      {
        data: {
          ...data,
          name: data.name.trim(),
          description: data.description.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success("Plano criado com sucesso!");
          navigate({ to: "/plans" });
        },
        onError: (e) => {
          const fieldErrors = getApiFieldErrors(e, PLAN_FIELDS);
          if (fieldErrors) {
            setErrors(fieldErrors);
            return;
          }

          toast.error(
            <div>
              <strong>{e?.error ?? "Erro"}</strong>
              <br />
              <span>{e?.message ?? "Erro inesperado"}</span>
            </div>,
          );
        },
      },
    );
  };

  return (
    <Form
      title="Dados do plano"
      description="Informações base para identificar e criar um plano."
      onSubmit={handleSubmit}
      actions={
        <>
          <Button
            onClick={() => navigate({ to: "/plans" })}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={isPending}>
            Salvar
          </Button>
        </>
      }
    >
      <div className={styles.row}>
        <TextField
          label="Nome"
          id="name"
          value={data.name}
          onChange={(event) => {
            set("name")(event);
            setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          minLength={PLAN_LIMITS.name.minLength}
          maxLength={PLAN_LIMITS.name.maxLength}
          helperText={`${data.name.length}/${PLAN_LIMITS.name.maxLength} caracteres. Mínimo de ${PLAN_LIMITS.name.minLength}.`}
          error={errors.name}
          required
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="Descrição"
          id="description"
          value={data.description}
          onChange={(event) => {
            set("description")(event);
            setErrors((prev) => ({ ...prev, description: undefined }));
          }}
          maxLength={PLAN_LIMITS.description.maxLength}
          helperText={`${data.description.length}/${PLAN_LIMITS.description.maxLength} caracteres.`}
          error={errors.description}
          required
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="Valor mensal"
          id="monthlyPrice"
          inputMode="numeric"
          value={formatCurrencyInput(data.monthlyPrice)}
          onChange={(event) => {
            const monthlyPrice = parseCurrencyInput(event.target.value);
            if (monthlyPrice > PLAN_LIMITS.monthlyPrice.max) return;

            setData((prev) => ({
              ...prev,
              monthlyPrice,
            }));
            setErrors((prev) => ({ ...prev, monthlyPrice: undefined }));
          }}
          maxLength={6}
          placeholder="50,00"
          helperText="Valor entre R$ 0,01 e R$ 500,00."
          error={errors.monthlyPrice}
          required
        />
        <TextField
          label="Duração em meses"
          id="durationMonths"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          minLength={1}
          maxLength={2}
          value={data.durationMonths || ""}
          onChange={(event) => {
            const value = event.target.value;
            if (!/^\d{0,2}$/.test(value)) return;

            const durationMonths = value ? Number(value) : 0;
            if (durationMonths > PLAN_LIMITS.durationMonths.max) return;

            setData((prev) => ({ ...prev, durationMonths }));
            setErrors((prev) => ({
              ...prev,
              durationMonths: undefined,
            }));
          }}
          helperText="Número inteiro entre 1 e 24 meses."
          error={errors.durationMonths}
          required
        />
      </div>
    </Form>
  );
};


