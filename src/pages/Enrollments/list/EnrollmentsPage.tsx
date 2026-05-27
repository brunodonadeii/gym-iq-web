import { Autocomplete } from "@/components/Autocomplete/Autocomplete";
import { Button } from "@/components/Button/Button";
import { Dropdown, type DropdownItem } from "@/components/Dropdown/Dropdown";
import { Pagination } from "@/components/Pagination/Pagination";
import { Skeleton } from "@/components/Skeleton/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableSkeletonRows,
} from "@/components/Table/Table";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useUpdateEnrollmentStatus } from "@/mutations/useUpdateEnrollmentStatus";
import type { Enrollment, EnrollmentStatus } from "@/pages/Enrollments/types";
import { useGetActiveStudentEnrollment } from "@/queries/useGetActiveStudentEnrollment";
import { useGetEnrollments } from "@/queries/useGetEnrollments";
import { useGetPlans } from "@/queries/useGetPlans";
import { useGetStudentEnrollments } from "@/queries/useGetStudentEnrollments";
import { useGetStudentOptions } from "@/queries/useGetStudentOptions";
import { useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  CircleOff,
  PauseCircle,
  PlusCircle,
  RefreshCcw,
  UserRoundSearch,
} from "lucide-react";
import { useState } from "react";
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

const isRecurringEnrollment = (enrollment?: Enrollment | null) => {
  if (!enrollment) {
    return false;
  }

  const rawEndDate = enrollment.endDate;
  const normalizedEndDate =
    typeof rawEndDate === "string" ? rawEndDate.trim().toLowerCase() : rawEndDate;

  return (
    normalizedEndDate === null ||
    normalizedEndDate === undefined ||
    normalizedEndDate === "" ||
    normalizedEndDate === "null" ||
    enrollment.plan?.durationMonths === 1
  );
};

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Não informado";

const formatEndDate = (enrollment?: Enrollment | null) =>
  isRecurringEnrollment(enrollment) ? "Recorrente" : formatDate(enrollment?.endDate);

const getEnrollmentTermLabel = (enrollment?: Enrollment | null) =>
  isRecurringEnrollment(enrollment) ? "Mensal recorrente" : "Prazo determinado";

const resolveStudentName = (enrollment: Enrollment) =>
  enrollment.student?.name ??
  enrollment.studentName ??
  `Aluno #${enrollment.studentId}`;

const resolveStudentEmail = (enrollment: Enrollment) =>
  enrollment.student?.email ?? enrollment.studentEmail ?? "Sem e-mail";

const resolvePlanName = (enrollment: Enrollment) =>
  enrollment.plan?.name ?? enrollment.planName ?? `Plano #${enrollment.planId}`;

const canChangeAccessStatus = (status: EnrollmentStatus) =>
  status !== "CANCELED";

export const EnrollmentsPage = () => {
  const navigate = useNavigate();
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [selectedStudentEmail, setSelectedStudentEmail] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const debouncedStudentSearch = useDebouncedValue(studentSearch);

  const {
    data: allEnrollments,
    isLoading: isLoadingAllEnrollments,
    isFetching: isFetchingAllEnrollments,
  } = useGetEnrollments({
    page,
    size,
    sort: "createdAt,desc",
  });
  const { data: studentOptions, isFetching: isFetchingStudentOptions } =
    useGetStudentOptions(debouncedStudentSearch);
  const { data: plans } = useGetPlans("active", {
    size: 100,
    sort: "name,asc",
  });
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateEnrollmentStatus();

  const studentFilterEnabled = selectedStudentId !== "";

  const {
    data: filteredEnrollments,
    isLoading: isLoadingStudentEnrollments,
    isFetching: isFetchingStudentEnrollments,
  } = useGetStudentEnrollments(selectedStudentId, studentFilterEnabled, {
    page,
    size,
    sort: "createdAt,desc",
  });

  const { data: activeEnrollment, isLoading: isLoadingActiveEnrollment } =
    useGetActiveStudentEnrollment(selectedStudentId, studentFilterEnabled);

  const enrollments = studentFilterEnabled
    ? (filteredEnrollments?.content ?? [])
    : (allEnrollments?.content ?? []);

  const currentPage = studentFilterEnabled ? filteredEnrollments : allEnrollments;
  const isLoadingEnrollments = studentFilterEnabled
    ? isLoadingStudentEnrollments
    : isLoadingAllEnrollments;
  const isFetchingEnrollments = studentFilterEnabled
    ? isFetchingStudentEnrollments
    : isFetchingAllEnrollments;
  const tableLoading = isLoadingEnrollments || isFetchingEnrollments;

  const autocompleteStudentOptions =
    studentOptions?.map((student) => ({
      label: student.label,
      value: String(student.studentId),
      description: student.email,
    })) ?? [];

  const summaryPlanLabel =
    activeEnrollment && plans
      ? (plans.content.find((plan) => plan.planId === activeEnrollment.planId)
          ?.name ?? resolvePlanName(activeEnrollment))
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

    if (enrollment.status === "CANCELED") {
      return [
        {
          label: "Nenhuma ação disponível",
          icon: <RefreshCcw size={15} />,
          disabled: true,
        },
      ];
    }

    const recurringEnrollment = isRecurringEnrollment(enrollment);
    const renewAction: DropdownItem = recurringEnrollment
      ? {
          label: "Renovar matrícula",
          icon: <RefreshCcw size={15} />,
          disabled: true,
        }
      : {
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
      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <strong className={styles.topBarTitle}>Filtro por aluno</strong>
          <span className={styles.topBarSubtitle}>
            Escolha um aluno para ver histórico e matrícula ativa, ou mantenha a
            visão geral.
          </span>
        </div>

        <div className={styles.topBarActions}>
          <Autocomplete
            label="Aluno"
            id="studentFilter"
            search={studentSearch}
            onSearchChange={(value) => {
              setStudentSearch(value);
              setSelectedStudentId("");
              setSelectedStudentName("");
              setSelectedStudentEmail("");
              setPage(0);
            }}
            onSelect={(option) => {
              const selectedOption = studentOptions?.find(
                (student) => String(student.studentId) === option.value,
              );

              setSelectedStudentId(option.value);
              setSelectedStudentName(selectedOption?.name ?? option.label);
              setSelectedStudentEmail(selectedOption?.email ?? "");
              setStudentSearch(option.label);
              setPage(0);
            }}
            onClear={() => {
              setStudentSearch("");
              setSelectedStudentId("");
              setSelectedStudentName("");
              setSelectedStudentEmail("");
              setPage(0);
            }}
            options={autocompleteStudentOptions}
            loading={isFetchingStudentOptions}
            placeholder="Buscar por nome, CPF ou e-mail"
            containerClassName={styles.filterField}
          />
          <Button
            leftIcon={<PlusCircle size={18} />}
            onClick={() => navigate({ to: "/enrollments/create" })}
          >
            Nova matrícula
          </Button>
        </div>
      </div>

      {studentFilterEnabled && (
        <section className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <div>
              <span className={styles.summaryEyebrow}>Aluno selecionado</span>
              <h3 className={styles.summaryTitle}>
                {selectedStudentName || `Aluno #${selectedStudentId}`}
              </h3>
              <p className={styles.summaryDescription}>
                {selectedStudentEmail || "Sem e-mail informado"}
              </p>
            </div>
            <div className={styles.summaryBadge}>
              <UserRoundSearch size={16} />
              {isLoadingStudentEnrollments ? (
                <Skeleton width="132px" height="16px" />
              ) : (
                `${currentPage?.totalElements ?? 0} matrícula(s)`
              )}
            </div>
          </div>

          <div className={styles.activePanel}>
            <div>
              <span className={styles.panelLabel}>Matrícula ativa</span>
              {isLoadingActiveEnrollment ? (
                <div className={styles.panelSkeleton}>
                  <Skeleton width="180px" height="22px" />
                  <Skeleton width="140px" height="14px" />
                </div>
              ) : activeEnrollment ? (
                <>
                  <p className={styles.panelValue}>
                    {summaryPlanLabel ?? resolvePlanName(activeEnrollment)}
                  </p>
                  <p className={styles.panelHint}>
                    Vigência: {formatEndDate(activeEnrollment)}
                  </p>
                  <span className={styles.termBadge}>
                    {getEnrollmentTermLabel(activeEnrollment)}
                  </span>
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
              criação em uma visão única. Total encontrado:{" "}
              {currentPage?.totalElements ?? 0}.
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
              {tableLoading && <TableSkeletonRows columns={8} />}

              {!tableLoading &&
                enrollments.map((enrollment) => (
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
                    <TableCell>
                      <div className={styles.termCell}>
                        <span>{formatEndDate(enrollment)}</span>
                        <span className={styles.termBadge}>
                          {getEnrollmentTermLabel(enrollment)}
                        </span>
                      </div>
                    </TableCell>
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

              {!tableLoading && enrollments.length === 0 && (
                <TableEmptyState
                  colSpan={8}
                  message="Nenhuma matrícula encontrada."
                />
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination
          page={currentPage}
          currentPage={page}
          loading={isFetchingEnrollments}
          onPageChange={setPage}
          onSizeChange={(nextSize) => {
            setSize(nextSize);
            setPage(0);
          }}
        />
      </section>
    </div>
  );
};
