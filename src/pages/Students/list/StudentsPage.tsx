import { Button } from "@/components/Button/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog/ConfirmDialog";
import { Dropdown } from "@/components/Dropdown/Dropdown";
import { ListToolbar } from "@/components/ListToolbar/ListToolbar";
import { Pagination } from "@/components/Pagination/Pagination";
import { SearchBar } from "@/components/SearchBar/SearchBar";
import { SelectField } from "@/components/SelectField/SelectField";
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
import { useActivateStudent } from "@/mutations/useActivateStudent";
import { useDeactivateStudent } from "@/mutations/useDeactivateStudent";
import { useDeleteStudentPersonalData } from "@/mutations/useDeleteStudentPersonalData";
import {
  isAnonymizedStudent,
  type StudentSummary,
} from "@/pages/Students/types";
import {
  fetchStudents,
  STUDENTS_QUERY_GC_TIME,
  STUDENTS_QUERY_STALE_TIME,
  type StudentStatusQuery,
  useGetStudents,
} from "@/queries/useGetStudents";
import {
  fetchStudentPersonalDataDeletionEligibility,
  studentDeletionEligibilityKeys,
  type StudentPersonalDataDeletionEligibility,
} from "@/queries/useGetStudentPersonalDataDeletionEligibility";
import { auth } from "@/utils/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  EyeOff,
  Pencil,
  RotateCcw,
  Search,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import styles from "./StudentsPage.module.css";

const studentColumns = [
  { width: "48%" },
  { width: "18%" },
  { width: "16%" },
  { width: "18%" },
];

type ConfirmAction =
  | { type: "deactivate"; studentId: string; studentName: string }
  | {
      type: "delete";
      studentId: string;
      studentName: string;
      eligibility: StudentPersonalDataDeletionEligibility;
    };

type StudentStatusFilter = "all" | "active" | "inactive";

const studentStatusQueryMap: Record<StudentStatusFilter, StudentStatusQuery> = {
  all: "ALL",
  active: "ACTIVE",
  inactive: "INACTIVE",
};

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "-";

const hasFinancialPendingDeleteError = (error: {
  error?: string;
  message?: string;
}) =>
  error.error === "BUSINESS_RULE_VIOLATION" &&
  (error.message ?? "").toLowerCase().includes("pendências financeiras");

export const StudentsPage = () => {
  const isAdmin = auth.hasAnyRole(["ADMIN"]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudentStatusFilter>(
    isAdmin ? "all" : "active",
  );
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null,
  );
  const [checkingDeletionEligibilityStudentId, setCheckingDeletionEligibilityStudentId] =
    useState("");
  const debouncedSearch = useDebouncedValue(search);
  const pagination = {
    page,
    size,
    sort: "user.name,asc",
  };
  const statusQuery = studentStatusQueryMap[statusFilter];

  const { data, isLoading, isFetching } = useGetStudents(
    debouncedSearch,
    statusQuery,
    pagination,
  );
  const { mutate: deactivateStudent, isPending: isDeactivatingStudent } =
    useDeactivateStudent();
  const { mutate: activateStudent, isPending: isActivatingStudent } =
    useActivateStudent();
  const {
    mutate: deleteStudentPersonalData,
    isPending: isDeletingStudentPersonalData,
  } = useDeleteStudentPersonalData();
  const visibleStudents = data?.content ?? [];
  const tableLoading = isLoading;

  const preventAnonymizedAction = (student?: StudentSummary) => {
    if (!isAnonymizedStudent(student)) return false;

    toast.error("Não é possível executar ações em um cadastro anonimizado.");
    return true;
  };

  const handleDeactivateStudent = (studentId: string) => {
    const student = visibleStudents.find(
      (currentStudent) => currentStudent.studentId === studentId,
    );
    if (preventAnonymizedAction(student)) return;

    deactivateStudent(
      { id: studentId },
      {
        onSuccess: () => {
          toast.success("Aluno inativado com sucesso!");
          setConfirmAction(null);
        },
        onError: (e) => {
          toast.error(
            <div>
              <strong>{e?.error ?? "Erro"}</strong>
              <br />
              <span>
                {e?.message ?? "Não foi possível inativar o aluno."}
              </span>
            </div>,
          );
        },
      },
    );
  };

  const handleViewStudentPayments = (studentId: string, studentName: string) => {
    navigate({
      to: "/payments",
      search: {
        mode: "student",
        status: "all",
        studentId,
        studentName,
        enrollmentId: "",
      },
    });
  };

  const handleDeleteStudentPersonalData = (
    studentId: string,
    studentName: string,
  ) => {
    const student = visibleStudents.find(
      (currentStudent) => currentStudent.studentId === studentId,
    );
    if (preventAnonymizedAction(student)) return;

    deleteStudentPersonalData(
      { id: studentId },
      {
        onSuccess: () => {
          toast.success("Cadastro do aluno excluído com sucesso!");
          queryClient.invalidateQueries({
            queryKey: studentDeletionEligibilityKeys.byStudent(studentId),
          });
          setConfirmAction(null);
        },
        onError: (e) => {
          if (hasFinancialPendingDeleteError(e)) {
            const toastId = toast.error(
              <div className={styles.pendingToast}>
                <div>
                  <strong>{e?.error ?? "Erro"}</strong>
                  <br />
                  <span>
                    {e?.message ??
                      "Não foi possível excluir os dados do aluno."}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.pendingToastAction}
                  onClick={() => {
                    toast.dismiss(toastId);
                    handleViewStudentPayments(studentId, studentName);
                  }}
                >
                  Ver pendências
                </button>
              </div>,
            );
            return;
          }

          toast.error(
            <div>
              <strong>{e?.error ?? "Erro"}</strong>
              <br />
              <span>
                {e?.message ?? "Não foi possível excluir os dados do aluno."}
              </span>
            </div>,
          );
        },
      },
    );
  };

  const handleRequestDeleteStudentPersonalData = async (
    studentId: string,
    studentName: string,
  ) => {
    const student = visibleStudents.find(
      (currentStudent) => currentStudent.studentId === studentId,
    );
    if (preventAnonymizedAction(student)) return;

    setCheckingDeletionEligibilityStudentId(studentId);

    try {
      const eligibility = await queryClient.fetchQuery({
        queryKey: studentDeletionEligibilityKeys.byStudent(studentId),
        queryFn: () => fetchStudentPersonalDataDeletionEligibility(studentId),
        staleTime: 30 * 1000,
      });

      setConfirmAction({
        type: "delete",
        studentId,
        studentName,
        eligibility,
      });
    } catch (e) {
      const error = e as { error?: string; message?: string };

      toast.error(
        <div>
          <strong>{error?.error ?? "Erro"}</strong>
          <br />
          <span>
            {error?.message ??
              "Não foi possível verificar se o aluno pode ser excluído."}
          </span>
        </div>,
      );
    } finally {
      setCheckingDeletionEligibilityStudentId("");
    }
  };

  const handleActivateStudent = (studentId: string) => {
    const student = visibleStudents.find(
      (currentStudent) => currentStudent.studentId === studentId,
    );
    if (preventAnonymizedAction(student)) return;

    activateStudent(
      { id: studentId },
      {
        onSuccess: () => {
          toast.success("Aluno ativado com sucesso!");
        },
        onError: (e) => {
          toast.error(
            <div>
              <strong>{e?.error ?? "Erro"}</strong>
              <br />
              <span>{e?.message ?? "Não foi possível ativar o aluno."}</span>
            </div>,
          );
        },
      },
    );
  };

  useEffect(() => {
    if (!data || data.last) return;

    const nextPagination = {
      page: page + 1,
      size,
      sort: "user.name,asc",
    };

    queryClient.prefetchQuery({
      queryKey: ["students", debouncedSearch, statusQuery, nextPagination],
      queryFn: () => fetchStudents(debouncedSearch, statusQuery, nextPagination),
      staleTime: STUDENTS_QUERY_STALE_TIME,
      gcTime: STUDENTS_QUERY_GC_TIME,
    });
  }, [data, data?.last, debouncedSearch, page, queryClient, size, statusQuery]);

  const handleConfirmAction = () => {
    if (!confirmAction) return;

    if (confirmAction.type === "deactivate") {
      handleDeactivateStudent(confirmAction.studentId);
      return;
    }

    handleDeleteStudentPersonalData(
      confirmAction.studentId,
      confirmAction.studentName,
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <ListToolbar
          search={
            <SearchBar
              icon={<Search size={15} />}
              placeholder="Buscar por nome ou por CPF/e-mail completos"
              containerClassName={styles.searchField}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          }
          filters={
            <SelectField
              label="Status"
              id="studentStatusFilter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StudentStatusFilter);
                setPage(0);
              }}
              options={[
                { label: "Ativos", value: "active" },
                ...(isAdmin
                  ? [
                      { label: "Inativos", value: "inactive" as const },
                      { label: "Todos", value: "all" as const },
                    ]
                  : []),
              ]}
              containerProps={{ className: styles.filterField }}
            />
          }
          action={
            <Button
              leftIcon={<UserPlus size={18} />}
              onClick={() => navigate({ to: "/students/create" })}
            >
              Novo Aluno
            </Button>
          }
        />
      </div>

      <section className={styles.tableSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Lista principal</h3>
            <p className={styles.sectionDescription}>
              {visibleStudents.length} aluno(s) exibido(s) nesta página.
            </p>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <Table columns={studentColumns}>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Nome</TableHeaderCell>
                <TableHeaderCell>Criado em</TableHeaderCell>
                <TableHeaderCell center>Status</TableHeaderCell>
                <TableHeaderCell center>Ações</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tableLoading && <TableSkeletonRows columns={4} />}

              {!tableLoading &&
                visibleStudents.map((student) => {
                  const anonymized = isAnonymizedStudent(student);

                  return (
                    <TableRow key={student.studentId}>
                      <TableCell>
                        <div className={styles.nameCell}>
                          <span className={styles.namePrimary}>
                            {student.name}
                          </span>
                          {anonymized && (
                            <span className={styles.anonymizedBadge}>
                              Cadastro removido
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(student.createdAt)}</TableCell>
                      <TableCell center>
                        <span
                          className={`${styles.statusBadge} ${
                            student.active
                              ? styles.statusActive
                              : styles.statusInactive
                          }`}
                        >
                          {student.active ? "Ativo" : "Inativo"}
                        </span>
                      </TableCell>
                      <TableCell center>
                        {anonymized ? (
                          <span className={styles.noActions}>
                            Sem ações disponíveis
                          </span>
                        ) : (
                          <Dropdown
                            items={[
                              {
                                label: "Editar",
                                icon: <Pencil size={15} />,
                                onSelect: () =>
                                  navigate({
                                    to: "/students/$studentId",
                                    params: {
                                      studentId: String(student.studentId),
                                    },
                                  }),
                              },
                              {
                                label: "Inativar aluno",
                                icon: <UserMinus size={15} />,
                                danger: true,
                                disabled:
                                  !student.active || isDeactivatingStudent,
                                onSelect: () =>
                                  setConfirmAction({
                                    type: "deactivate",
                                    studentId: String(student.studentId),
                                    studentName: student.name,
                                  }),
                              },
                              ...(!student.active
                                ? [
                                    {
                                      label: "Ativar aluno",
                                      icon: <RotateCcw size={15} />,
                                      disabled: isActivatingStudent,
                                      onSelect: () =>
                                        handleActivateStudent(
                                          String(student.studentId),
                                        ),
                                    },
                                    {
                                      label: "Excluir",
                                      icon: <EyeOff size={15} />,
                                      disabled:
                                        isDeletingStudentPersonalData ||
                                        checkingDeletionEligibilityStudentId ===
                                          String(student.studentId),
                                      onSelect: () =>
                                        handleRequestDeleteStudentPersonalData(
                                          String(student.studentId),
                                          student.name,
                                        ),
                                    },
                                  ]
                                : []),
                            ]}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}

              {!tableLoading && visibleStudents.length === 0 && (
                <TableEmptyState
                  colSpan={4}
                  message="Nenhum aluno encontrado."
                />
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination
          page={data}
          currentPage={page}
          loading={isFetching}
          onPageChange={setPage}
          onSizeChange={(nextSize) => {
            setSize(nextSize);
            setPage(0);
          }}
        />
      </section>

      <ConfirmDialog
        open={!!confirmAction}
        title={
          confirmAction?.type === "delete"
            ? "Excluir cadastro do aluno?"
            : "Inativar aluno?"
        }
        description={
          confirmAction?.type === "delete"
            ? confirmAction.eligibility.canAnonymize
              ? (
                  <>
                    Os dados pessoais de{" "}
                    <strong>{confirmAction.studentName}</strong> serão{" "}
                    <strong>excluídos</strong> e o histórico será preservado.
                    Esta ação <strong>não pode ser desfeita</strong>.
                  </>
                )
              : (
                  <div className={styles.eligibilityBlock}>
                    <p>
                      Os dados de <strong>{confirmAction.studentName}</strong>{" "}
                      ainda não podem ser <strong>excluídos</strong>.
                    </p>
                    <ul>
                      {confirmAction.eligibility.blockers.map((blocker) => (
                        <li key={blocker}>{blocker}</li>
                      ))}
                    </ul>
                    {confirmAction.eligibility.hasFinancialPendingIssues && (
                      <button
                        type="button"
                        className={styles.pendingToastAction}
                        onClick={() =>
                          handleViewStudentPayments(
                            confirmAction.studentId,
                            confirmAction.studentName,
                          )
                        }
                      >
                        Ver pendências
                      </button>
                    )}
                  </div>
                )
            : confirmAction
              ? (
                  <>
                    <strong>{confirmAction.studentName}</strong> perderá o{" "}
                    <strong>acesso ativo</strong>, mas o histórico será
                    preservado.
                  </>
                )
              : ""
        }
        confirmLabel={
          confirmAction?.type === "delete" ? "Excluir" : "Inativar aluno"
        }
        loading={isDeactivatingStudent || isDeletingStudentPersonalData}
        confirmDisabled={
          confirmAction?.type === "delete" &&
          !confirmAction.eligibility.canAnonymize
        }
        onCancel={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
};



