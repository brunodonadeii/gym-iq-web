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

const isRecurringEnrollment = (enrollment?: Enrollment | null) =>
  enrollment?.endDate === null;

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Não informado";

const formatEndDate = (enrollment?: Enrollment | null) =>
  isRecurringEnrollment(enrollment)
    ? "Recorrente"
    : formatDate(enrollment?.endDate);

const resolveStudentName = (enrollment?: Enrollment) =>
  enrollment?.student?.name ??
  enrollment?.studentName ??
  (enrollment ? `Aluno #${enrollment.studentId}` : "Aluno");

const resolvePlanName = (enrollment?: Enrollment) =>
  enrollment?.plan?.name ??
  enrollment?.planName ??
  (enrollment ? `Plano #${enrollment.planId}` : "Plano");

type EnrollmentsRenewFormProps = {
  enrollment?: Enrollment;
  enrollmentId?: string;
  initialData: EnrollmentRenewFormData;
  loading: boolean;
  planOptions: Array<{ label: string; value: string; disabled?: boolean }>;
  recurring: boolean;
};

const EnrollmentsRenewForm = ({
  enrollment,
  enrollmentId,
  initialData,
  loading,
  planOptions,
  recurring,
}: EnrollmentsRenewFormProps) => {
  const navigate = useNavigate();
  const { mutate, isPending } = useRenewEnrollment();
  const [data, setData] = useState<EnrollmentRenewFormData>(initialData);
  const [planError, setPlanError] = useState("");
  const { set } = useFormInputs(setData);

  const handleSubmit = () => {
    if (recurring) {
      toast.info("Matrículas recorrentes não permitem renovação manual.");
      return;
    }

    if (!data.newPlanId) {
      setPlanError("Selecione o novo plano.");
      return;
    }

    mutate(
      { id: String(enrollmentId), newPlanId: data.newPlanId },
      {
        onSuccess: () => {
          toast.success("Matrícula renovada com sucesso!");
          navigate({ to: "/enrollments" });
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
      title="Renovação de matrícula"
      description="Escolha o novo plano para renovar o contrato do aluno selecionado."
      loading={loading}
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
            disabled={recurring}
          >
            {recurring ? "Renovação automática" : "Renovar"}
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
          <span className={styles.summaryLabel}>Vigência atual</span>
          <strong className={styles.summaryValue}>
            {formatEndDate(enrollment)}
          </strong>
        </div>
      </div>

      {recurring && (
        <div className={styles.notice}>
          Essa matrícula é recorrente e não deve ser renovada manualmente.
        </div>
      )}

      <div className={styles.row}>
        <SelectField
          label="Novo plano"
          id="newPlanId"
          value={data.newPlanId}
          onChange={(event) => {
            set("newPlanId")(event);
            setPlanError("");
          }}
          options={planOptions}
          disabled={recurring}
          error={planError || undefined}
          required
        />
      </div>
    </Form>
  );
};

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

  const enrollment = useMemo(
    () =>
      enrollments?.content.find(
        (item) => String(item.enrollmentId) === String(enrollmentId),
      ),
    [enrollmentId, enrollments],
  );
  const recurring = isRecurringEnrollment(enrollment);
  const loading = isLoadingEnrollments || isLoadingPlans;
  const initialData = enrollment
    ? { newPlanId: String(enrollment.planId) }
    : EMPTY_FORM;

  useEffect(() => {
    if (recurring) {
      toast.info("Matrículas recorrentes não permitem renovação manual.");
      navigate({ to: "/enrollments" });
    }
  }, [navigate, recurring]);

  const planOptions = [
    { label: "Selecione o novo plano", value: "", disabled: true },
    ...(plans?.content.map((plan) => ({
      label: plan.name,
      value: String(plan.planId),
    })) ?? []),
  ];

  return (
    <EnrollmentsRenewForm
      key={`${enrollmentId ?? "new"}-${initialData.newPlanId}-${loading}`}
      enrollment={enrollment}
      enrollmentId={enrollmentId}
      initialData={initialData}
      loading={loading}
      planOptions={planOptions}
      recurring={recurring}
    />
  );
};
