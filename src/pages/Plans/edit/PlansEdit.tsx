import { Button } from "@/components/Button/Button";
import { Form } from "@/components/Form/Form";
import { TextField } from "@/components/TextField/TextField";
import { useFormInputs } from "@/hooks/useFormInputs";
import { useUpdatePlan } from "@/mutations/useUpdatePlan";
import type { PlanFormData } from "@/pages/Plans/types";
import { useGetPlanById } from "@/queries/useGetPlanById";
import { formatCurrencyInput, parseCurrencyInput } from "@/utils/currency";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import styles from "./PlansEdit.module.css";

const EMPTY_FORM: PlanFormData = {
  name: "",
  description: "",
  durationMonths: 1,
  monthlyPrice: 0,
};

export const PlansEdit = () => {
  const params = useParams({ strict: false });
  const planId = params.planId;
  const [data, setData] = useState<PlanFormData>(EMPTY_FORM);
  const { set } = useFormInputs(setData);
  const { mutate: mutateUpdate, isPending } = useUpdatePlan();
  const { data: details, isLoading } = useGetPlanById(planId);
  const navigate = useNavigate();

  useEffect(() => {
    if (details) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData({
        name: details.name,
        description: details.description,
        monthlyPrice: details.monthlyPrice,
        durationMonths: details.durationMonths,
      });
    }
  }, [details]);

  const handleSubmit = () => {
    mutateUpdate(
      { id: planId, data },
      {
        onSuccess: () => {
          toast.success("Plano editado com sucesso!");
          navigate({ to: "/plans" });
        },
        onError: (e) => {
          toast.error(
            <div>
              <strong>{e?.erro ?? e?.error ?? "Erro"}</strong>
              <br />
              <span>{e?.mensagem ?? e?.message ?? "Erro inesperado"}</span>
            </div>,
          );
        },
      },
    );
  };

  return (
    <Form
      title="Dados do plano"
      description="Informações base para identificar e editar um plano."
      loading={isLoading}
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
          label="Duração em meses"
          id="durationMonths"
          value={data.durationMonths}
          onChange={set("durationMonths")}
          required
        />
      </div>
    </Form>
  );
};

