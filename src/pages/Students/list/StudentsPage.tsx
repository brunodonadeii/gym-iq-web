import { Button } from "@/components/Button/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog/ConfirmDialog";
import { Dropdown } from "@/components/Dropdown/Dropdown";
import { ListToolbar } from "@/components/ListToolbar/ListToolbar";
import { Pagination } from "@/components/Pagination/Pagination";
import { SearchBar } from "@/components/SearchBar/SearchBar";
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
import { useAnonymizeStudent } from "@/mutations/useAnonymizeStudent";
import { useDeactivateStudent } from "@/mutations/useDeactivateStudent";
import { isAnonymizedStudent } from "@/pages/Students/types";
import {
  fetchStudents,
  STUDENTS_QUERY_GC_TIME,
  STUDENTS_QUERY_STALE_TIME,
  useGetStudents,
} from "@/queries/useGetStudents";
import { maskCpf, maskEmail, maskPhone } from "@/utils/sensitiveData";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { EyeOff, Pencil, Search, UserMinus, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import styles from "./StudentsPage.module.css";

const studentColumns = [
  { width: "24%" },
  { width: "16%" },
  { width: "16%" },
  { width: "22%" },
  { width: "12%" },
  { width: "10%" },
];

type ConfirmAction =
  | { type: "deactivate"; studentId: string; studentName: string }
  | { type: "anonymize"; studentId: string; studentName: string };

const getSensitiveValue = (
  value: string | undefined,
  maskedValue: string,
  anonymized: boolean,
) => {
  if (anonymized) {
    return value || "-";
  }

  return maskedValue;
};

export const StudentsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
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
  const { mutate: anonymizeStudent, isPending: isAnonymizingStudent } =
    useAnonymizeStudent();
  const students = data?.content ?? [];
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
              placeholder="Buscar por nome, CPF ou email"
              containerClassName={styles.searchField}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
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
              {data?.totalElements ?? 0} aluno(s) encontrado(s).
            </p>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <Table columns={studentColumns}>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Nome</TableHeaderCell>
                <TableHeaderCell>CPF</TableHeaderCell>
                <TableHeaderCell>Telefone</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell center>Status</TableHeaderCell>
                <TableHeaderCell center>Acoes</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tableLoading && <TableSkeletonRows columns={6} />}

              {!tableLoading &&
                students.map((student) => {
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
                      <TableCell>
                        {getSensitiveValue(
                          student.cpf,
                          maskCpf(student.cpf),
                          anonymized,
                        )}
                      </TableCell>
                      <TableCell>
                        {getSensitiveValue(
                          student.phone,
                          maskPhone(student.phone),
                          anonymized,
                        )}
                      </TableCell>
                      <TableCell>
                        {getSensitiveValue(
                          student.email,
                          maskEmail(student.email),
                          anonymized,
                        )}
                      </TableCell>
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

              {!tableLoading && students.length === 0 && (
                <TableEmptyState
                  colSpan={6}
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
            ? `Os dados pessoais de ${confirmAction.studentName} serao removidos e o historico sera preservado. Esta acao exige que o aluno ja esteja inativo.`
            : confirmAction
              ? `${confirmAction.studentName} perdera o acesso ativo, mas o historico sera preservado.`
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
