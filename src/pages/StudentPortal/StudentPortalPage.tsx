import { Button } from "@/components/Button/Button";
import { Skeleton } from "@/components/Skeleton/Skeleton";
import { useGetMyActiveEnrollment } from "@/queries/useGetMyActiveEnrollment";
import { useGetMyEnrollments } from "@/queries/useGetMyEnrollments";
import { useGetMyPayments } from "@/queries/useGetMyPayments";
import { useGetMyPresences } from "@/queries/useGetMyPresences";
import { useGetMyWorkoutSheets } from "@/queries/useGetMyWorkoutSheets";
import { useGetStudentMe } from "@/queries/useGetStudentMe";
import { clearAuthStorage } from "@/utils/auth";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { WorkoutSheetCard } from "./components/WorkoutSheetCard";
import styles from "./StudentPortalPage.module.css";
import {
  enrollmentStatusLabels,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatEnrollmentEndDate,
  getEnrollmentStatusClassName,
  getPaymentStatusClassName,
  paymentStatusLabels,
} from "./utils";

export const StudentPortalPage = () => {
  const [expandedSheetId, setExpandedSheetId] = useState<number | null>(null);
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
    clearAuthStorage();
    navigate({ to: "/login" });
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>Area do aluno</span>
            <h1 className={styles.title}>
              {isLoadingStudent ? (
                <Skeleton width="280px" height="3rem" />
              ) : (
                `Ola, ${student?.name ?? "aluno"}`
              )}
            </h1>
            <p className={styles.subtitle}>
              Acompanhe sua matricula, pagamentos, presencas e fichas de treino.
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
                  <strong>{student?.email ?? "Nao informado"}</strong>
                </div>
                <div className={styles.detail}>
                  <span>CPF</span>
                  <strong>{student?.cpf ?? "Nao informado"}</strong>
                </div>
                <div className={styles.detail}>
                  <span>Telefone</span>
                  <strong>{student?.phone ?? "Nao informado"}</strong>
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
              <h2 className={styles.cardTitle}>Matricula ativa</h2>
              {activeEnrollment?.status && (
                <span
                  className={getEnrollmentStatusClassName(
                    activeEnrollment.status,
                    styles,
                  )}
                >
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
                  <span>Inicio</span>
                  <strong>{formatDate(activeEnrollment.startDate)}</strong>
                </div>
                <div className={styles.detail}>
                  <span>Fim</span>
                  <strong>
                    {formatEnrollmentEndDate(activeEnrollment.endDate)}
                  </strong>
                </div>
                <div className={styles.detail}>
                  <span>Criada em</span>
                  <strong>{formatDate(activeEnrollment.createdAt)}</strong>
                </div>
              </div>
            ) : (
              <div className={styles.empty}>
                Nenhuma matricula ativa encontrada.
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
                    <span
                      className={getPaymentStatusClassName(payment.status, styles)}
                    >
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
            <h2 className={styles.cardTitle}>Ultimas presencas</h2>

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
                        Saida: {formatDateTime(presence.checkOutAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>Nenhuma presenca encontrada.</div>
            )}
          </article>

          <article className={`${styles.card} ${styles.wide}`}>
            <h2 className={styles.cardTitle}>Fichas de treino ativas</h2>

            {isLoadingWorkoutSheets ? (
              <Skeleton height="180px" radius="18px" />
            ) : workoutSheets?.content.length ? (
              <div className={styles.list}>
                {workoutSheets.content.map((sheet) => (
                  <WorkoutSheetCard
                    key={sheet.workoutSheetId}
                    sheet={sheet}
                    expanded={expandedSheetId === sheet.workoutSheetId}
                    onToggle={() =>
                      setExpandedSheetId((current) =>
                        current === sheet.workoutSheetId
                          ? null
                          : sheet.workoutSheetId,
                      )
                    }
                  />
                ))}
              </div>
            ) : (
              <div className={styles.empty}>Nenhuma ficha ativa encontrada.</div>
            )}
          </article>

          <article className={`${styles.card} ${styles.wide}`}>
            <h2 className={styles.cardTitle}>Historico de matriculas</h2>

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
                        {formatDate(enrollment.startDate)} ate{" "}
                        {formatEnrollmentEndDate(enrollment.endDate)}
                      </p>
                    </div>
                    <span
                      className={getEnrollmentStatusClassName(
                        enrollment.status,
                        styles,
                      )}
                    >
                      {enrollmentStatusLabels[enrollment.status]}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>Nenhuma matricula encontrada.</div>
            )}
          </article>
        </section>
      </div>
    </main>
  );
};
