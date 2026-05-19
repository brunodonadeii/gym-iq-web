import { Button } from "@/components/Button/Button";
import { Form } from "@/components/Form/Form";
import { SelectField } from "@/components/SelectField/SelectField";
import { useFormInputs } from "@/hooks/useFormInputs";
import { useRenewEnrollment } from "@/mutations/useRenewEnrollment";
import type {
  Enrollment,
  EnrollmentRenewFormData,
} from "@/pages/Enrollments/types";
import { useGetEnrollments } from "@/queries/useGetEnrollments";
import { useGetPlans } from "@/queries/useGetPlans";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import styles from "./EnrollmentsRenew.module.css";

const EMPTY_FORM: EnrollmentRenewFormData = {
  newPlanId: "",
};

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Nao informado";

const resolveStudentName = (enrollment?: Enrollment) =>
  enrollment?.student?.name ??
  enrollment?.studentName ??
  (enrollment ? `Aluno #${enrollment.studentId}` : "Aluno");

const resolvePlanName = (enrollment?: Enrollment) =>
  enrollment?.plan?.name ??
  enrollment?.planName ??
  (enrollment ? `Plano #${enrollment.planId}` : "Plano");

export const EnrollmentsRenew = () => {
  const params = useParams({ strict: false });
  const enrollmentId = params.enrollmentId;
  const navigate = useNavigate();
  const { data: enrollments, isLoading: isLoadingEnrollments } =
    useGetEnrollments({ size: 100, sort: "createdAt,desc" });
  const { data: plans, isLoading: isLoadingPlans } = useGetPlans("active", {
    size: 100,
    sort: "name,asc",
  });
  const { mutate, isPending } = useRenewEnrollment();
  const [data, setData] = useState<EnrollmentRenewFormData>(EMPTY_FORM);
  const { set } = useFormInputs(setData);

  const enrollment = useMemo(
    () =>
      enrollments?.content.find(
        (item) => String(item.enrollmentId) === String(enrollmentId),
      ),
    [enrollmentId, enrollments],
  );

  useEffect(() => {
    if (enrollment) {
      setData({ newPlanId: String(enrollment.planId) });
    }
  }, [enrollment]);

  const planOptions = [
    { label: "Selecione o novo plano", value: "", disabled: true },
    ...(plans?.content.map((plan) => ({
      label: plan.name,
      value: String(plan.planId),
    })) ?? []),
  ];

  const handleSubmit = () => {
    mutate(
      { id: String(enrollmentId), newPlanId: data.newPlanId },
      {
        onSuccess: () => {
          toast.success("Matricula renovada com sucesso!");
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
      },
    );
  };

  return (
    <Form
      title="Renovacao de matricula"
      description="Escolha o novo plano para renovar o contrato do aluno selecionado."
      loading={isLoadingEnrollments || isLoadingPlans}
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
            disabled={!data.newPlanId}
          >
            Renovar
          </Button>
        </>
      }
    >
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Aluno</span>
          <strong className={styles.summaryValue}>
            {resolveStudentName(enrollment)}
          </strong>
        </div>

        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Plano atual</span>
          <strong className={styles.summaryValue}>
            {resolvePlanName(enrollment)}
          </strong>
        </div>

        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Vigencia atual</span>
          <strong className={styles.summaryValue}>
            {formatDate(enrollment?.endDate)}
          </strong>
        </div>
      </div>

      <div className={styles.row}>
        <SelectField
          label="Novo plano"
          id="newPlanId"
          value={data.newPlanId}
          onChange={set("newPlanId")}
          options={planOptions}
          required
        />
      </div>
    </Form>
  );
};
