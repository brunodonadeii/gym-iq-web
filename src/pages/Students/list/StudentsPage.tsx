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
import { useAnonymizeStudent } from "@/mutations/useAnonymizeStudent";
import { useDeactivateStudent } from "@/mutations/useDeactivateStudent";
import { isAnonymizedStudent } from "@/pages/Students/types";
import {
  fetchStudents,
  STUDENTS_QUERY_GC_TIME,
  STUDENTS_QUERY_STALE_TIME,
  useGetStudents,
} from "@/queries/useGetStudents";
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
  | { type: "anonymize"; studentId: string; studentName: string };

type StudentStatusFilter = "all" | "active" | "inactive";

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "-";

export const StudentsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudentStatusFilter>("all");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null,
  );
  const debouncedSearch = useDebouncedValue(search);
  const pagination = {
    page,
    size,
    sort: "user.name,asc",
  };

  const { data, isLoading, isFetching } = useGetStudents(
    debouncedSearch,
    pagination,
  );
  const { mutate: deactivateStudent, isPending: isDeactivatingStudent } =
    useDeactivateStudent();
  const { mutate: activateStudent, isPending: isActivatingStudent } =
    useActivateStudent();
  const { mutate: anonymizeStudent, isPending: isAnonymizingStudent } =
    useAnonymizeStudent();
  const students = data?.content ?? [];
  const visibleStudents = students.filter((student) =>
    statusFilter === "active"
      ? student.active
      : statusFilter === "inactive"
        ? !student.active
        : true,
  );
  const tableLoading = isLoading;

  const handleDeactivateStudent = (studentId: string) => {
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
              <strong>{e?.erro ?? e?.error ?? "Erro"}</strong>
              <br />
              <span>
                {e?.mensagem ?? e?.message ?? "Nao foi possivel inativar o aluno."}
              </span>
            </div>,
          );
        },
      },
    );
  };

  const handleAnonymizeStudent = (studentId: string) => {
    anonymizeStudent(
      { id: studentId },
      {
        onSuccess: () => {
          toast.success("Aluno anonimizado com sucesso!");
          setConfirmAction(null);
        },
        onError: (e) => {
          const message =
            e?.mensagem ??
            e?.message ??
            "Nao foi possivel anonimizar o aluno.";

          toast.error(
            <div>
              <strong>{e?.erro ?? e?.error ?? "Erro"}</strong>
              <br />
              <span>
                {/ativo/i.test(message)
                  ? "O aluno precisa estar inativo antes da anonimização."
                  : message}
              </span>
            </div>,
          );
        },
      },
    );
  };

  const handleActivateStudent = (studentId: string) => {
    activateStudent(
      { id: studentId },
      {
        onSuccess: () => {
          toast.success("Aluno ativado com sucesso!");
        },
        onError: (e) => {
          toast.error(
            <div>
              <strong>{e?.erro ?? e?.error ?? "Erro"}</strong>
              <br />
              <span>
                {e?.mensagem ?? e?.message ?? "Nao foi possivel ativar o aluno."}
              </span>
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
      queryKey: ["students", debouncedSearch, nextPagination],
      queryFn: () => fetchStudents(debouncedSearch, nextPagination),
      staleTime: STUDENTS_QUERY_STALE_TIME,
      gcTime: STUDENTS_QUERY_GC_TIME,
    });
  }, [data, data?.last, debouncedSearch, page, queryClient, size]);

  const handleConfirmAction = () => {
    if (!confirmAction) return;

    if (confirmAction.type === "deactivate") {
      handleDeactivateStudent(confirmAction.studentId);
      return;
    }

    handleAnonymizeStudent(confirmAction.studentId);
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
                { label: "Todos", value: "all" },
                { label: "Ativos", value: "active" },
                { label: "Inativos", value: "inactive" },
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
                        <Dropdown
                          items={[
                            {
                              label: "Editar",
                              icon: <Pencil size={15} />,
                              disabled: anonymized,
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
                              disabled: !student.active || isDeactivatingStudent,
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
                                    disabled:
                                      isActivatingStudent || anonymized,
                                    onSelect: () =>
                                      handleActivateStudent(
                                        String(student.studentId),
                                      ),
                                  },
                                  {
                                    label: "Anonimizar aluno",
                                    icon: <EyeOff size={15} />,
                                    disabled:
                                      isAnonymizingStudent || anonymized,
                                    onSelect: () =>
                                      setConfirmAction({
                                        type: "anonymize",
                                        studentId: String(student.studentId),
                                        studentName: student.name,
                                      }),
                                  },
                                ]
                              : []),
                          ]}
                        />
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
          confirmAction?.type === "anonymize"
            ? "Anonimizar aluno?"
            : "Inativar aluno?"
        }
        description={
          confirmAction?.type === "anonymize"
            ? `Os dados pessoais de ${confirmAction.studentName} serão removidos e o histórico será preservado. Esta ação exige que o aluno já esteja inativo.`
            : confirmAction
              ? `${confirmAction.studentName} perderá o acesso ativo, mas o histórico será preservado.`
              : ""
        }
        confirmLabel={
          confirmAction?.type === "anonymize"
            ? "Anonimizar aluno"
            : "Inativar aluno"
        }
        loading={isDeactivatingStudent || isAnonymizingStudent}
        onCancel={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
};
