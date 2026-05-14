import { Button } from "@/components/Button/Button";
import { Dropdown, type DropdownItem } from "@/components/Dropdown/Dropdown";
import { SelectField } from "@/components/SelectField/SelectField";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/Table/Table";
import type { Enrollment, EnrollmentStatus } from "@/pages/Enrollments/types";
import { useGetActiveStudentEnrollment } from "@/queries/useGetActiveStudentEnrollment";
import { useGetEnrollments } from "@/queries/useGetEnrollments";
import { useGetPlans } from "@/queries/useGetPlans";
import { useGetStudents } from "@/queries/useGetStudents";
import { useGetStudentEnrollments } from "@/queries/useGetStudentEnrollments";
import { useUpdateEnrollmentStatus } from "@/mutations/useUpdateEnrollmentStatus";
import { useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  CircleOff,
  PauseCircle,
  PlusCircle,
  RefreshCcw,
  UserRoundSearch,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import styles from "./EnrollmentsPage.module.css";

const enrollmentColumns = [
  { width: "16%" },
  { width: "18%" },
  { width: "16%" },
  { width: "12%" },
  { width: "12%" },
  { width: "10%" },
  { width: "10%" },
  { width: "6%" },
];

const statusLabels: Record<EnrollmentStatus, string> = {
  ACTIVE: "Acesso ativo",
  SUSPENDED: "Acesso suspenso",
  CANCELED: "Cancelada",
};

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Nao informado";

const resolveStudentName = (enrollment: Enrollment) =>
  enrollment.student?.name ??
  enrollment.studentName ??
  `Aluno #${enrollment.studentId}`;

const resolveStudentEmail = (enrollment: Enrollment) =>
  enrollment.student?.email ?? enrollment.studentEmail ?? "Sem email";

const resolvePlanName = (enrollment: Enrollment) =>
  enrollment.plan?.name ?? enrollment.planName ?? `Plano #${enrollment.planId}`;

const canChangeAccessStatus = (status: EnrollmentStatus) =>
  status !== "CANCELED";

export const EnrollmentsPage = () => {
  const navigate = useNavigate();
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const { data: allEnrollments } = useGetEnrollments();
  const { data: students } = useGetStudents("");
  const { data: plans } = useGetPlans();
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateEnrollmentStatus();

  const studentFilterEnabled = selectedStudentId !== "";

  const { data: filteredEnrollments, isLoading: isLoadingStudentEnrollments } =
    useGetStudentEnrollments(selectedStudentId, studentFilterEnabled);

  const { data: activeEnrollment, isLoading: isLoadingActiveEnrollment } =
    useGetActiveStudentEnrollment(selectedStudentId, studentFilterEnabled);

  const enrollments = studentFilterEnabled
    ? (filteredEnrollments ?? [])
    : (allEnrollments ?? []);

  const activeCount = useMemo(
    () => enrollments.filter((item) => item.status === "ACTIVE").length,
    [enrollments],
  );

  const selectedStudent = students?.find(
    (student) => String(student.studentId) === selectedStudentId,
  );

  const selectedPlanCount = useMemo(() => {
    const ids = new Set(enrollments.map((item) => item.planId));
    return ids.size;
  }, [enrollments]);

  const studentOptions = [
    { label: "Todos os alunos", value: "" },
    ...(students?.map((student) => ({
      label: student.name,
      value: String(student.studentId),
    })) ?? []),
  ];

  const summaryPlanLabel =
    activeEnrollment && plans
      ? (plans.find((plan) => plan.planId === activeEnrollment.planId)?.name ??
        resolvePlanName(activeEnrollment))
      : null;

  const handleStatusChange = (id: string, newStatus: EnrollmentStatus) => {
    updateStatus(
      { id, newStatus },
      {
        onSuccess: () => {
          toast.success("Status de acesso atualizado com sucesso!");
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

  const getEnrollmentActions = (enrollment: Enrollment): DropdownItem[] => {
    const enrollmentId = String(enrollment.enrollmentId);
    const renewAction = {
      label: "Renovar matrícula",
      icon: <RefreshCcw size={15} />,
      onSelect: () =>
        navigate({
          to: "/enrollments/$enrollmentId",
          params: {
            enrollmentId,
          },
        }),
    };

    if (enrollment.status === "CANCELED") {
      return [renewAction];
    }

    const statusActions =
      enrollment.status === "ACTIVE"
        ? [
            {
              label: "Suspender acesso",
              icon: <PauseCircle size={15} />,
              disabled: isUpdatingStatus,
              onSelect: () => handleStatusChange(enrollmentId, "SUSPENDED"),
            },
          ]
        : [
            {
              label: "Ativar acesso",
              icon: <BadgeCheck size={15} />,
              disabled: isUpdatingStatus,
              onSelect: () => handleStatusChange(enrollmentId, "ACTIVE"),
            },
          ];

    return [
      renewAction,
      ...statusActions,
      {
        label: "Cancelar matrícula",
        icon: <CircleOff size={15} />,
        danger: true,
        disabled: isUpdatingStatus || !canChangeAccessStatus(enrollment.status),
        onSelect: () => handleStatusChange(enrollmentId, "CANCELED"),
      },
    ];
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.metricsCard}>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Total exibído</span>
            <strong className={styles.metricValue}>{enrollments.length}</strong>
            <p className={styles.metricHint}>
              {studentFilterEnabled
                ? "Histórico filtrado por aluno."
                : "Matriz completa de matrículas."}
            </p>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Acesso ativo</span>
            <strong className={styles.metricValue}>{activeCount}</strong>
            <p className={styles.metricHint}>
              Matrículas válidas com acesso liberado.
            </p>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Planos no recorte</span>
            <strong className={styles.metricValue}>{selectedPlanCount}</strong>
            <p className={styles.metricHint}>
              Diversidade de planos vinculados.
            </p>
          </div>
        </div>
      </section>

      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <strong className={styles.topBarTitle}>Filtro por aluno</strong>
          <span className={styles.topBarSubtitle}>
            Escolha um aluno para ver histórico e matrícula ativa, ou mantenha a
            visão geral.
          </span>
        </div>

        <div className={styles.topBarActions}>
          <SelectField
            label="Aluno"
            id="studentFilter"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            options={studentOptions}
            containerProps={{ className: styles.filterField }}
          />
          <Button
            leftIcon={<PlusCircle size={18} />}
            onClick={() => navigate({ to: "/enrollments/create" })}
          >
            Nova Matrícula
          </Button>
        </div>
      </div>

      {studentFilterEnabled && (
        <section className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <div>
              <span className={styles.summaryEyebrow}>Aluno selecionado</span>
              <h3 className={styles.summaryTitle}>
                {selectedStudent?.name ?? `Aluno #${selectedStudentId}`}
              </h3>
              <p className={styles.summaryDescription}>
                {selectedStudent?.email ?? "Sem email informado"}
              </p>
            </div>
            <div className={styles.summaryBadge}>
              <UserRoundSearch size={16} />
              {isLoadingStudentEnrollments
                ? "Carregando histórico..."
                : `${enrollments.length} matrícula(s)`}
            </div>
          </div>

          <div className={styles.activePanel}>
            <div>
              <span className={styles.panelLabel}>Matrícula ativa</span>
              {isLoadingActiveEnrollment ? (
                <p className={styles.panelValue}>Carregando...</p>
              ) : activeEnrollment ? (
                <>
                  <p className={styles.panelValue}>
                    {summaryPlanLabel ?? resolvePlanName(activeEnrollment)}
                  </p>
                  <p className={styles.panelHint}>
                    Vigência ate {formatDate(activeEnrollment.endDate)}
                  </p>
                </>
              ) : (
                <>
                  <p className={styles.panelValue}>Nenhuma matrícula ativa</p>
                  <p className={styles.panelHint}>
                    Esse aluno não possui contrato ativo no momento.
                  </p>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      <section className={styles.tableSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Lista principal</h3>
            <p className={styles.sectionDescription}>
              Consulte aluno, plano, vigência, status de acesso e data de
              criação em uma visão única.
            </p>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <Table columns={enrollmentColumns} minWidth="1180px">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Aluno</TableHeaderCell>
                <TableHeaderCell>E-mail</TableHeaderCell>
                <TableHeaderCell>Plano</TableHeaderCell>
                <TableHeaderCell>Início</TableHeaderCell>
                <TableHeaderCell>Fim</TableHeaderCell>
                <TableHeaderCell center>Status</TableHeaderCell>
                <TableHeaderCell>Criação</TableHeaderCell>
                <TableHeaderCell center>Ações</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {enrollments.map((enrollment) => (
                <TableRow key={enrollment.enrollmentId}>
                  <TableCell>
                    <div className={styles.nameCell}>
                      <span className={styles.namePrimary}>
                        {resolveStudentName(enrollment)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{resolveStudentEmail(enrollment)}</TableCell>
                  <TableCell>{resolvePlanName(enrollment)}</TableCell>
                  <TableCell>{formatDate(enrollment.startDate)}</TableCell>
                  <TableCell>{formatDate(enrollment.endDate)}</TableCell>
                  <TableCell center>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[`status${enrollment.status}`]
                      }`}
                    >
                      {statusLabels[enrollment.status]}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(enrollment.createdAt)}</TableCell>
                  <TableCell center>
                    <Dropdown items={getEnrollmentActions(enrollment)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
};
