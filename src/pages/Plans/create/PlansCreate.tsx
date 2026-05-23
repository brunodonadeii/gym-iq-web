import { Button } from "@/components/Button/Button";
import { TextField } from "@/components/TextField/TextField";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useFormInputs } from "@/hooks/useFormInputs";
import { Form } from "@/components/Form/Form";
import type { PlanFormData } from "../types";
import { formatCurrencyInput, parseCurrencyInput } from "@/utils/currency";
import styles from "./PlansCreate.module.css";

import { useCreatePlan } from "@/mutations/useCreatePlan";

const EMPTY_FORM: PlanFormData = {
  name: "",
  description: "",
  durationDays: 0,
  monthlyPrice: 0,
};

export const PlansCreate = () => {
  const [data, setData] = useState<PlanFormData>(EMPTY_FORM);
  const { set } = useFormInputs(setData);
  const { mutate, isPending } = useCreatePlan();
  const navigate = useNavigate();

  const handleSubmit = () => {
    mutate(
      { data },
      {
        onSuccess: () => {
          toast.success("Plano editado com sucesso!");
        },
        onError: (e) => {
          toast.error(
            <div>
              <strong>{e?.erro ?? "Erro"}</strong>
              <br />
              <span>{e?.mensagem ?? "Erro inesperado"}</span>
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
      actions={
        <>
          <Button
            onClick={() => navigate({ to: "/plans" })}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={isPending}>
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
          onChange={set("name")}
          required
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="Descrição"
          id="description"
          value={data.description}
          onChange={set("description")}
          required
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="Valor mensal"
          id="monthlyPrice"
          inputMode="numeric"
          value={formatCurrencyInput(data.monthlyPrice)}
          onChange={(event) =>
            setData((prev) => ({
              ...prev,
              monthlyPrice: parseCurrencyInput(event.target.value),
            }))
          }
          placeholder="50,00"
          required
        />
        <TextField
          label="Duração em dias"
          id="durationDays"
          value={data.durationDays}
          onChange={set("durationDays")}
          required
        />
      </div>
    </Form>
  );
};
