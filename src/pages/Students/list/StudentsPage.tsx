import { Button } from "@/components/Button/Button";
import { Dropdown } from "@/components/Dropdown/Dropdown";
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

export const StudentsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
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
    const shouldContinue = window.confirm(
      "Deseja inativar este aluno? O histórico será preservado e ele perderá o acesso ativo.",
    );

    if (!shouldContinue) return;

    deactivateStudent(
      { id: studentId },
      {
        onSuccess: () => {
          toast.success("Aluno inativado com sucesso!");
        },
        onError: (e) => {
          toast.error(
            <div>
              <strong>{e?.erro ?? "Erro"}</strong>
              <br />
              <span>
                {e?.mensagem ??
                  e?.message ??
                  "Não foi possível inativar o aluno."}
              </span>
            </div>,
          );
        },
      },
    );
  };

  const handleAnonymizeStudent = (studentId: string) => {
    const shouldContinue = window.confirm(
      "Deseja anonimizar este aluno? A anonimização só pode ocorrer após a inativação, preserva o histórico e remove os dados pessoais.",
    );

    if (!shouldContinue) return;

    anonymizeStudent(
      { id: studentId },
      {
        onSuccess: () => {
          toast.success("Aluno anonimizado com sucesso!");
        },
        onError: (e) => {
          const message =
            e?.mensagem ??
            e?.message ??
            "Não foi possível anonimizar o aluno.";

          toast.error(
            <div>
              <strong>{e?.erro ?? "Erro"}</strong>
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

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <SearchBar
          icon={<Search size={15} />}
          placeholder="Buscar por nome, CPF ou email"
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
        <Button
          leftIcon={<UserPlus size={18} />}
          onClick={() => navigate({ to: "/students/create" })}
        >
          Novo Aluno
        </Button>
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
                <TableHeaderCell center>Ações</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tableLoading && <TableSkeletonRows columns={6} />}

              {!tableLoading &&
                students.map((student) => (
                  <TableRow key={student.studentId}>
                    <TableCell>
                      <div className={styles.nameCell}>
                        <span className={styles.namePrimary}>
                          {student.name}
                        </span>
                        {isAnonymizedStudent(student) && (
                          <span className={styles.anonymizedBadge}>
                            Anonimizado
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{student.cpf}</TableCell>
                    <TableCell>{student.phone}</TableCell>
                    <TableCell>{student.email}</TableCell>
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
                              handleDeactivateStudent(String(student.studentId)),
                          },
                          ...(!student.active
                            ? [
                                {
                                  label: "Anonimizar aluno",
                                  icon: <EyeOff size={15} />,
                                  disabled:
                                    isAnonymizingStudent ||
                                    isAnonymizedStudent(student),
                                  onSelect: () =>
                                    handleAnonymizeStudent(
                                      String(student.studentId),
                                    ),
                                },
                              ]
                            : []),
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}

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
    </div>
  );
};
