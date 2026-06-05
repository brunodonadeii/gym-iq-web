import { Autocomplete } from "@/components/Autocomplete/Autocomplete";
import { Button } from "@/components/Button/Button";
import { Form } from "@/components/Form/Form";
import { TextField } from "@/components/TextField/TextField";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useFormInputs } from "@/hooks/useFormInputs";
import { useCreateEnrollment } from "@/mutations/useCreateEnrollment";
import type { EnrollmentCreateFormData } from "@/pages/Enrollments/types";
import { useGetStudentOptions } from "@/queries/useGetStudentOptions";
import { useGetPlans } from "@/queries/useGetPlans";
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
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [studentSearch, setStudentSearch] = useState("");
  const [planSearch, setPlanSearch] = useState("");
  const debouncedStudentSearch = useDebouncedValue(studentSearch);
  const { set } = useFormInputs(setData);
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateEnrollment();
  const { data: studentOptions, isFetching: isFetchingStudentOptions } =
    useGetStudentOptions(debouncedStudentSearch);
  const { data: plans, isLoading: isLoadingPlans } = useGetPlans("active", "", {
    size: 100,
    sort: "name,asc",
  });

  const loadingDependencies = isLoadingPlans;

  const autocompleteStudentOptions =
    studentOptions?.map((student) => ({
      label: student.label,
      value: String(student.studentId),
      description: student.email,
    })) ?? [];

  const autocompletePlanOptions =
    plans?.content
      .filter((plan) =>
        plan.name.toLowerCase().includes(planSearch.toLowerCase()),
      )
      .map((plan) => ({
        label: plan.name,
        value: String(plan.planId),
        description: `R$ ${plan.monthlyPrice} - ${plan.durationMonths} meses`,
      })) ?? [];

  const validate = () => {
    const nextErrors: Partial<Record<string, string>> = {};

    if (!data.studentId) nextErrors.studentId = "Selecione o aluno.";
    if (!data.planId) nextErrors.planId = "Selecione o plano.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    mutate(data, {
      onSuccess: () => {
        toast.success("Matrícula criada com sucesso!");
        navigate({ to: "/enrollments" });
      },
      onError: (e) => {
        toast.error(
          <div>
            <strong>{e?.error ?? "Erro"}</strong>
            <br />
            <span>{e?.message ?? "Erro inesperado"}</span>
          </div>,
        );
      },
    });
  };

  return (
    <Form
      title="Dados da matrícula"
      description="Selecione o aluno, o plano e defina a data inicial quando precisar agendar a vigência."
      loading={loadingDependencies}
      actions={
        <>
          <Button
            onClick={() => navigate({ to: "/enrollments" })}
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
        <Autocomplete
          label="Aluno"
          id="studentId"
          search={studentSearch}
          onSearchChange={(value) => {
            setStudentSearch(value);
            setData((prev) => ({ ...prev, studentId: "" }));
            setErrors((prev) => ({ ...prev, studentId: undefined }));
          }}
          onSelect={(option) => {
            setStudentSearch(option.label);
            setData((prev) => ({ ...prev, studentId: option.value }));
            setErrors((prev) => ({ ...prev, studentId: undefined }));
          }}
          onClear={() => {
            setStudentSearch("");
            setData((prev) => ({ ...prev, studentId: "" }));
          }}
          options={autocompleteStudentOptions}
          loading={isFetchingStudentOptions}
          placeholder="Digite nome, CPF ou e-mail"
          helperText="Busca leve em /students/options."
          error={errors.studentId}
          required
        />
        <Autocomplete
          label="Plano"
          id="planId"
          search={planSearch}
          onSearchChange={(value) => {
            setPlanSearch(value);
            setData((prev) => ({ ...prev, planId: "" }));
            setErrors((prev) => ({ ...prev, planId: undefined }));
          }}
          onSelect={(option) => {
            setPlanSearch(option.label);
            setData((prev) => ({ ...prev, planId: option.value }));
            setErrors((prev) => ({ ...prev, planId: undefined }));
          }}
          onClear={() => {
            setPlanSearch("");
            setData((prev) => ({ ...prev, planId: "" }));
          }}
          options={autocompletePlanOptions}
          loading={isLoadingPlans}
          placeholder="Digite o nome do plano"
          error={errors.planId}
          required
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="Data de início"
          id="startDate"
          type="date"
          value={data.startDate}
          onChange={set("startDate")}
        />
      </div>
    </Form>
  );
};


