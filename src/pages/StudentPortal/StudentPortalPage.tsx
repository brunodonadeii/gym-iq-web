import { Button } from "@/components/Button/Button";
import { Skeleton } from "@/components/Skeleton/Skeleton";
import type { EnrollmentStatus } from "@/pages/Enrollments/types";
import type { PaymentStatus } from "@/pages/Payments/types";
import { useGetMyActiveEnrollment } from "@/queries/useGetMyActiveEnrollment";
import { useGetMyEnrollments } from "@/queries/useGetMyEnrollments";
import { useGetMyPayments } from "@/queries/useGetMyPayments";
import { useGetMyPresences } from "@/queries/useGetMyPresences";
import { useGetMyWorkoutSheets } from "@/queries/useGetMyWorkoutSheets";
import { useGetStudentMe } from "@/queries/useGetStudentMe";
import { useNavigate } from "@tanstack/react-router";
import styles from "./StudentPortalPage.module.css";

const enrollmentStatusLabels: Record<EnrollmentStatus, string> = {
  ACTIVE: "Ativa",
  SUSPENDED: "Suspensa",
  CANCELED: "Cancelada",
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  OVERDUE: "Atrasado",
};

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Não informado";

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Não informado";

const formatCurrency = (value?: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value ?? 0);

const getPaymentStatusClassName = (status: PaymentStatus) => {
  if (status === "PAID") return `${styles.badge} ${styles.successBadge}`;
  if (status === "OVERDUE") return `${styles.badge} ${styles.dangerBadge}`;

  return `${styles.badge} ${styles.warningBadge}`;
};

const getEnrollmentStatusClassName = (status?: EnrollmentStatus) => {
  if (status === "ACTIVE") return `${styles.badge} ${styles.successBadge}`;
  if (status === "CANCELED") return `${styles.badge} ${styles.dangerBadge}`;

  return `${styles.badge} ${styles.warningBadge}`;
};

export const StudentPortalPage = () => {
  const navigate = useNavigate();
  const { data: student, isLoading: isLoadingStudent } = useGetStudentMe();
  const { data: activeEnrollment, isLoading: isLoadingActiveEnrollment } =
    useGetMyActiveEnrollment();
  const { data: enrollments, isLoading: isLoadingEnrollments } =
    useGetMyEnrollments();
  const { data: payments, isLoading: isLoadingPayments } = useGetMyPayments();
  const { data: presences, isLoading: isLoadingPresences } =
    useGetMyPresences();
  const { data: workoutSheets, isLoading: isLoadingWorkoutSheets } =
    useGetMyWorkoutSheets();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate({ to: "/login" });
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>Área do aluno</span>
            <h1 className={styles.title}>
              {isLoadingStudent ? (
                <Skeleton width="280px" height="3rem" />
              ) : (
                `Olá, ${student?.name ?? "aluno"}`
              )}
            </h1>
            <p className={styles.subtitle}>
              Acompanhe sua matrícula, pagamentos, presenças e fichas de treino.
            </p>
          </div>

          <Button type="button" onClick={handleLogout}>
            Sair
          </Button>
        </header>

        <section className={styles.grid}>
          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Meus dados</h2>
            </div>

            {isLoadingStudent ? (
              <Skeleton height="160px" radius="18px" />
            ) : (
              <div className={styles.details}>
                <div className={styles.detail}>
                  <span>Email</span>
                  <strong>{student?.email ?? "Não informado"}</strong>
                </div>
                <div className={styles.detail}>
                  <span>CPF</span>
                  <strong>{student?.cpf ?? "Não informado"}</strong>
                </div>
                <div className={styles.detail}>
                  <span>Telefone</span>
                  <strong>{student?.phone ?? "Não informado"}</strong>
                </div>
                <div className={styles.detail}>
                  <span>Status</span>
                  <strong>{student?.active ? "Ativo" : "Inativo"}</strong>
                </div>
              </div>
            )}
          </article>

          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Matrícula ativa</h2>
              {activeEnrollment?.status && (
                <span className={getEnrollmentStatusClassName(activeEnrollment.status)}>
                  {enrollmentStatusLabels[activeEnrollment.status]}
                </span>
              )}
            </div>

            {isLoadingActiveEnrollment ? (
              <Skeleton height="160px" radius="18px" />
            ) : activeEnrollment ? (
              <div className={styles.details}>
                <div className={styles.detail}>
                  <span>Plano</span>
                  <strong>
                    {activeEnrollment.plan?.name ??
                      activeEnrollment.planName ??
                      `Plano #${activeEnrollment.planId}`}
                  </strong>
                </div>
                <div className={styles.detail}>
                  <span>Início</span>
                  <strong>{formatDate(activeEnrollment.startDate)}</strong>
                </div>
                <div className={styles.detail}>
                  <span>Fim</span>
                  <strong>{formatDate(activeEnrollment.endDate)}</strong>
                </div>
                <div className={styles.detail}>
                  <span>Criada em</span>
                  <strong>{formatDate(activeEnrollment.createdAt)}</strong>
                </div>
              </div>
            ) : (
              <div className={styles.empty}>
                Nenhuma matrícula ativa encontrada.
              </div>
            )}
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Pagamentos recentes</h2>

            {isLoadingPayments ? (
              <Skeleton height="180px" radius="18px" />
            ) : payments?.content.length ? (
              <div className={styles.list}>
                {payments.content.map((payment) => (
                  <div
                    className={styles.listItem}
                    key={payment.paymentId ?? payment.id}
                  >
                    <div>
                      <p className={styles.itemTitle}>
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className={styles.itemDescription}>
                        Vencimento: {formatDate(payment.dueDate)}
                      </p>
                    </div>
                    <span className={getPaymentStatusClassName(payment.status)}>
                      {paymentStatusLabels[payment.status]}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>Nenhum pagamento encontrado.</div>
            )}
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Últimas presenças</h2>

            {isLoadingPresences ? (
              <Skeleton height="180px" radius="18px" />
            ) : presences?.content.length ? (
              <div className={styles.list}>
                {presences.content.map((presence) => (
                  <div className={styles.listItem} key={presence.presenceId}>
                    <div>
                      <p className={styles.itemTitle}>
                        {formatDateTime(presence.checkInAt)}
                      </p>
                      <p className={styles.itemDescription}>
                        Saída: {formatDateTime(presence.checkOutAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                Nenhuma presença encontrada.
              </div>
            )}
          </article>

          <article className={`${styles.card} ${styles.wide}`}>
            <h2 className={styles.cardTitle}>Fichas de treino ativas</h2>

            {isLoadingWorkoutSheets ? (
              <Skeleton height="180px" radius="18px" />
            ) : workoutSheets?.content.length ? (
              <div className={styles.list}>
                {workoutSheets.content.map((sheet) => (
                  <div className={styles.listItem} key={sheet.workoutSheetId}>
                    <div>
                      <p className={styles.itemTitle}>{sheet.name}</p>
                      <p className={styles.itemDescription}>
                        {sheet.goal ?? "Sem objetivo informado"} | Instrutor:{" "}
                        {sheet.instructorName ??
                          sheet.instructor?.name ??
                          "Não informado"}
                      </p>
                    </div>
                    <span className={styles.badge}>
                      {sheet.exercises?.length ?? 0} exercício(s)
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>Nenhuma ficha ativa encontrada.</div>
            )}
          </article>

          <article className={`${styles.card} ${styles.wide}`}>
            <h2 className={styles.cardTitle}>
              Histórico de matrículas
            </h2>

            {isLoadingEnrollments ? (
              <Skeleton height="160px" radius="18px" />
            ) : enrollments?.content.length ? (
              <div className={styles.list}>
                {enrollments.content.map((enrollment) => (
                  <div
                    className={styles.listItem}
                    key={enrollment.enrollmentId}
                  >
                    <div>
                      <p className={styles.itemTitle}>
                        {enrollment.plan?.name ??
                          enrollment.planName ??
                          `Plano #${enrollment.planId}`}
                      </p>
                      <p className={styles.itemDescription}>
                        {formatDate(enrollment.startDate)} até{" "}
                        {formatDate(enrollment.endDate)}
                      </p>
                    </div>
                    <span className={getEnrollmentStatusClassName(enrollment.status)}>
                      {enrollmentStatusLabels[enrollment.status]}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                Nenhuma matrícula encontrada.
              </div>
            )}
          </article>
        </section>
      </div>
    </main>
  );
};
