import { Button } from "@/components/Button/Button";
import { DetailLoadState } from "@/components/DetailLoadState/DetailLoadState";
import { Form } from "@/components/Form/Form";
import { Autocomplete } from "@/components/Autocomplete/Autocomplete";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useRenewEnrollment } from "@/mutations/useRenewEnrollment";
import type {
  Enrollment,
  EnrollmentRenewFormData,
} from "@/pages/Enrollments/types";
import { useGetEnrollmentById } from "@/queries/useGetEnrollmentById";
import { useGetPlanOptions } from "@/queries/useGetPlanOptions";
import { getApiFieldErrors } from "@/utils/apiError";
import { formatLocalDate } from "@/utils/date";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import styles from "./EnrollmentsRenew.module.css";

const EMPTY_FORM: EnrollmentRenewFormData = {
  newPlanId: "",
};

const isRecurringEnrollment = (enrollment?: Enrollment | null) =>
  enrollment?.endDate === null;

const formatEndDate = (enrollment?: Enrollment | null) =>
  isRecurringEnrollment(enrollment)
    ? "Recorrente"
    : formatLocalDate(enrollment?.endDate);

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
  recurring: boolean;
};

const EnrollmentsRenewForm = ({
  enrollment,
  enrollmentId,
  initialData,
  loading,
  recurring,
}: EnrollmentsRenewFormProps) => {
  const navigate = useNavigate();
  const { mutate, isPending } = useRenewEnrollment();
  const [data, setData] = useState<EnrollmentRenewFormData>(initialData);
  const [planSearch, setPlanSearch] = useState(
    initialData.newPlanId ? resolvePlanName(enrollment) : "",
  );
  const [planError, setPlanError] = useState("");
  const debouncedPlanSearch = useDebouncedValue(planSearch);
  const {
    data: plans,
    isFetching: isFetchingPlans,
    isFetchingNextPage: isFetchingMorePlans,
    hasNextPage: hasMorePlans,
    fetchNextPage: fetchMorePlans,
  } = useGetPlanOptions(debouncedPlanSearch, !recurring);
  const planOptions =
    plans?.map((plan) => ({
      label: plan.name,
      value: String(plan.planId),
      description: `R$ ${plan.monthlyPrice} - ${plan.durationMonths} meses`,
    })) ?? [];

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
          const fieldErrors = getApiFieldErrors(e, [
            "newPlanId",
            "planId",
          ] as const);
          const planFieldError =
            fieldErrors?.newPlanId ?? fieldErrors?.planId;

          if (planFieldError) {
            setPlanError(planFieldError);
            document.getElementById("newPlanId")?.focus();
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
      title="Renovação de matrícula"
      description="Escolha o novo plano para renovar o contrato do aluno selecionado."
      loading={loading}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button
            onClick={() => navigate({ to: "/enrollments" })}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
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
        <Autocomplete
          label="Novo plano"
          id="newPlanId"
          search={planSearch}
          onSearchChange={(value) => {
            setPlanSearch(value);
            setData({ newPlanId: "" });
            setPlanError("");
          }}
          onSelect={(option) => {
            setPlanSearch(option.label);
            setData({ newPlanId: option.value });
            setPlanError("");
          }}
          onClear={() => {
            setPlanSearch("");
            setData({ newPlanId: "" });
          }}
          options={planOptions}
          loading={isFetchingPlans && planOptions.length === 0}
          loadingMore={isFetchingMorePlans}
          hasMoreOptions={Boolean(hasMorePlans)}
          onLoadMore={() => void fetchMorePlans()}
          placeholder="Digite o nome do plano"
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
  const {
    data: enrollment,
    error,
    isError,
    isLoading: isLoadingEnrollment,
  } = useGetEnrollmentById(enrollmentId);
  const recurring = isRecurringEnrollment(enrollment);
  const loading = isLoadingEnrollment;
  const initialData = enrollment
    ? { newPlanId: String(enrollment.planId) }
    : EMPTY_FORM;

  useEffect(() => {
    if (!isLoadingEnrollment && enrollment && recurring) {
      toast.info("Matrículas recorrentes não permitem renovação manual.");
      navigate({ to: "/enrollments" });
    }
  }, [enrollment, isLoadingEnrollment, navigate, recurring]);

  if (isError || (!isLoadingEnrollment && !enrollment)) {
    return (
      <DetailLoadState
        entity={{ name: "Matrícula", article: "esta", pronoun: "ela" }}
        error={error}
        onBack={() => navigate({ to: "/enrollments" })}
      />
    );
  }

  return (
    <EnrollmentsRenewForm
      key={`${enrollmentId ?? "new"}-${initialData.newPlanId}-${loading}`}
      enrollment={enrollment}
      enrollmentId={enrollmentId}
      initialData={initialData}
      loading={loading}
      recurring={recurring}
    />
  );
};


