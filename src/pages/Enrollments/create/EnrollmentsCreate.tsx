import { Button } from "@/components/Button/Button";
import { Form } from "@/components/Form/Form";
import { SelectField } from "@/components/SelectField/SelectField";
import { TextField } from "@/components/TextField/TextField";
import { useFormInputs } from "@/hooks/useFormInputs";
import { useCreateEnrollment } from "@/mutations/useCreateEnrollment";
import type { EnrollmentCreateFormData } from "@/pages/Enrollments/types";
import { useGetPlans } from "@/queries/useGetPlans";
import { useGetStudents } from "@/queries/useGetStudents";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import styles from "./EnrollmentsCreate.module.css";

const EMPTY_FORM: EnrollmentCreateFormData = {
  studentId: "",
  planId: "",
  startDate: "",
};

export const EnrollmentsCreate = () => {
  const [data, setData] = useState<EnrollmentCreateFormData>(EMPTY_FORM);
  const { set } = useFormInputs(setData);
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateEnrollment();
  const { data: students, isLoading: isLoadingStudents } = useGetStudents("");
  const { data: plans, isLoading: isLoadingPlans } = useGetPlans();

  const loadingDependencies = isLoadingStudents || isLoadingPlans;

  const studentOptions = [
    { label: "Selecione um aluno", value: "", disabled: true },
    ...(students?.map((student) => ({
      label: student.name,
      value: String(student.studentId),
    })) ?? []),
  ];

  const planOptions = [
    { label: "Selecione um plano", value: "", disabled: true },
    ...(plans?.map((plan) => ({
      label: plan.name,
      value: String(plan.planId),
    })) ?? []),
  ];

  const handleSubmit = () => {
    mutate(data, {
      onSuccess: () => {
        toast.success("Matricula criada com sucesso!");
        navigate({ to: "/enrollments" });
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
    });
  };

  return (
    <Form
      title="Dados da matricula"
      description="Selecione o aluno, o plano e defina a data inicial quando precisar agendar a vigencia."
      loading={loadingDependencies}
      actions={
        <>
          <Button
            onClick={() => navigate({ to: "/enrollments" })}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isPending}
            disabled={!data.studentId || !data.planId}
          >
            Salvar
          </Button>
        </>
      }
    >
      <div className={styles.row}>
        <SelectField
          label="Aluno"
          id="studentId"
          value={data.studentId}
          onChange={set("studentId")}
          options={studentOptions}
          required
        />
        <SelectField
          label="Plano"
          id="planId"
          value={data.planId}
          onChange={set("planId")}
          options={planOptions}
          required
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="Data de inicio"
          id="startDate"
          type="date"
          value={data.startDate}
          onChange={set("startDate")}
        />
      </div>
    </Form>
  );
};
