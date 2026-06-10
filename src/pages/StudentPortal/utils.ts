import type { EnrollmentStatus } from "@/pages/Enrollments/types";
import type { PaymentStatus } from "@/pages/Payments/types";
import type { WorkoutSheetExercise } from "@/pages/WorkoutSheets/types";
import { formatLocalDate } from "@/utils/date";

export const enrollmentStatusLabels: Record<EnrollmentStatus, string> = {
  ACTIVE: "Ativa",
  SUSPENDED: "Suspensa",
  CANCELED: "Cancelada",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  OVERDUE: "Atrasado",
  CANCELED: "Cancelado",
};

export const formatDate = formatLocalDate;

export const formatDateTimeAsDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Não informado";

export const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Não informado";

export const formatCurrency = (value?: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value ?? 0);

export const isRecurringEnrollment = (endDate?: string | null) =>
  endDate === null || endDate === undefined || endDate === "";

export const formatEnrollmentEndDate = (endDate?: string | null) =>
  isRecurringEnrollment(endDate) ? "Matrícula recorrente" : formatDate(endDate);

export const formatExerciseMeta = (
  sets?: number | string,
  repetitions?: string,
  restSeconds?: number | string | null,
) => {
  const parts = [
    sets ? `${sets} séries` : null,
    repetitions ? `${repetitions} repetições` : null,
    restSeconds ? `${restSeconds}s descanso` : null,
  ].filter(Boolean);

  return parts.join(" | ");
};

export const groupExercisesByTrainingSection = (
  exercises?: WorkoutSheetExercise[],
) => {
  if (!exercises?.length) return [];

  const groups = new Map<string, WorkoutSheetExercise[]>();

  exercises.forEach((exercise) => {
    const section = exercise.trainingSection?.trim() || "Treino";
    const current = groups.get(section) ?? [];
    current.push(exercise);
    groups.set(section, current);
  });

  return Array.from(groups.entries()).map(([section, items]) => ({
    section,
    exercises: items
      .slice()
      .sort(
        (a, b) => Number(a.executionOrder ?? 0) - Number(b.executionOrder ?? 0),
      ),
  }));
};

export const getPaymentStatusClassName = (
  status: PaymentStatus,
  styles: Record<string, string>,
) => {
  if (status === "PAID") return `${styles.badge} ${styles.successBadge}`;
  if (status === "OVERDUE") return `${styles.badge} ${styles.dangerBadge}`;
  if (status === "CANCELED") return `${styles.badge} ${styles.dangerBadge}`;

  return `${styles.badge} ${styles.warningBadge}`;
};

export const getEnrollmentStatusClassName = (
  status: EnrollmentStatus | undefined,
  styles: Record<string, string>,
) => {
  if (status === "ACTIVE") return `${styles.badge} ${styles.successBadge}`;
  if (status === "CANCELED") return `${styles.badge} ${styles.dangerBadge}`;

  return `${styles.badge} ${styles.warningBadge}`;
};


