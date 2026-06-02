import type { EnrollmentStatus } from "@/pages/Enrollments/types";
import type { PaymentStatus } from "@/pages/Payments/types";

export const enrollmentStatusLabels: Record<EnrollmentStatus, string> = {
  ACTIVE: "Ativa",
  SUSPENDED: "Suspensa",
  CANCELED: "Cancelada",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  OVERDUE: "Atrasado",
};

export const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Nao informado";

export const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Nao informado";

export const formatCurrency = (value?: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value ?? 0);

export const isRecurringEnrollment = (endDate?: string | null) =>
  endDate === null || endDate === undefined || endDate === "";

export const formatEnrollmentEndDate = (endDate?: string | null) =>
  isRecurringEnrollment(endDate) ? "Matricula recorrente" : formatDate(endDate);

export const formatExerciseMeta = (
  sets?: number | string,
  repetitions?: string,
  restSeconds?: number | string | null,
) => {
  const parts = [
    sets ? `${sets} series` : null,
    repetitions ? `${repetitions} repeticoes` : null,
    restSeconds ? `${restSeconds}s descanso` : null,
  ].filter(Boolean);

  return parts.join(" | ");
};

export const getPaymentStatusClassName = (
  status: PaymentStatus,
  styles: Record<string, string>,
) => {
  if (status === "PAID") return `${styles.badge} ${styles.successBadge}`;
  if (status === "OVERDUE") return `${styles.badge} ${styles.dangerBadge}`;

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
