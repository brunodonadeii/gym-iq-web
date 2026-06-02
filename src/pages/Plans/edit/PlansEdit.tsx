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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { set } = useFormInputs(setData);
  const { mutate: mutateUpdate, isPending } = useUpdatePlan();
  const { data: details, isLoading } = useGetPlanById(planId);
  const navigate = useNavigate();

  useEffect(() => {
    if (!details) return;

    setData({
      name: details.name,
      description: details.description,
      monthlyPrice: details.monthlyPrice,
      durationMonths: details.durationMonths,
    });
  }, [details]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!data.name.trim()) nextErrors.name = "Informe o nome.";
    if (!data.description.trim()) nextErrors.description = "Informe a descricao.";
    if (!data.monthlyPrice || Number(data.monthlyPrice) <= 0) {
      nextErrors.monthlyPrice = "Informe um valor mensal maior que zero.";
    }
    if (!data.durationMonths || Number(data.durationMonths) <= 0) {
      nextErrors.durationMonths = "Informe uma duracao maior que zero.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

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
      description="Informacoes base para identificar e editar um plano."
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
          onChange={(event) => {
            set("name")(event);
            setErrors((prev) => ({ ...prev, name: "" }));
          }}
          error={errors.name}
          required
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="Descricao"
          id="description"
          value={data.description}
          onChange={(event) => {
            set("description")(event);
            setErrors((prev) => ({ ...prev, description: "" }));
          }}
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
            setData((prev) => ({
              ...prev,
              monthlyPrice: parseCurrencyInput(event.target.value),
            }));
            setErrors((prev) => ({ ...prev, monthlyPrice: "" }));
          }}
          placeholder="50,00"
          error={errors.monthlyPrice}
          required
        />
        <TextField
          label="Duracao em meses"
          id="durationMonths"
          value={data.durationMonths}
          onChange={(event) => {
            set("durationMonths")(event);
            setErrors((prev) => ({ ...prev, durationMonths: "" }));
          }}
          error={errors.durationMonths}
          required
        />
      </div>
    </Form>
  );
};
