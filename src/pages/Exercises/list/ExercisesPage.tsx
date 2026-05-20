import { Button } from "@/components/Button/Button";
import { Dropdown } from "@/components/Dropdown/Dropdown";
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
import { useDeleteExercise } from "@/mutations/useDeleteExercise";
import type { Exercise } from "@/pages/Exercises/types";
import { fetchExercises, useGetExercises } from "@/queries/useGetExercises";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Pencil, PlusCircle, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import styles from "./ExercisesPage.module.css";

type ExerciseStatusFilter = "active" | "inactive" | "all";

const exerciseColumns = [
  { width: "28%" },
  { width: "22%" },
  { width: "30%" },
  { width: "10%" },
  { width: "8%" },
];

const getExerciseId = (exercise: Exercise) => String(exercise.exerciseId);

export const ExercisesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<ExerciseStatusFilter>("active");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const debouncedSearch = useDebouncedValue(search);
  const queryMode = statusFilter === "active" ? "active" : "all";

  const { data, isLoading, isFetching } = useGetExercises(
    queryMode,
    debouncedSearch,
    {
      page,
      size,
      sort: "name,asc",
    },
  );
  const { mutate: deleteExercise } = useDeleteExercise();
  const tableLoading = isLoading;

  useEffect(() => {
    if (!data || data.last) return;

    const nextPagination = {
      page: page + 1,
      size,
      sort: "name,asc",
    };

    queryClient.prefetchQuery({
      queryKey: ["exercises", queryMode, debouncedSearch, nextPagination],
      queryFn: () =>
        fetchExercises(queryMode, debouncedSearch, nextPagination),
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
    });
  }, [data, debouncedSearch, page, queryClient, queryMode, size]);

  const exercises = useMemo(() => {
    const content = data?.content ?? [];

    if (statusFilter === "inactive") {
      return content.filter((exercise) => exercise.active === false);
    }

    return content;
  }, [data, statusFilter]);

  const handleDelete = (id: string) => {
    deleteExercise(
      { id },
      {
        onSuccess: () => toast.success("Exercicio inativado com sucesso!"),
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

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <SearchBar
          icon={<Search size={15} />}
          placeholder="Buscar exercicio"
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />

        <div className={styles.topBarActions}>
          <SelectField
            label="Status"
            id="exerciseStatusFilter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ExerciseStatusFilter);
              setPage(0);
            }}
            options={[
              { label: "Ativos", value: "active" },
              { label: "Inativos", value: "inactive" },
              { label: "Todos", value: "all" },
            ]}
            containerProps={{ className: styles.filterField }}
          />
          <Button
            leftIcon={<PlusCircle size={18} />}
            onClick={() => navigate({ to: "/exercises/create" })}
          >
            Novo exercicio
          </Button>
        </div>
      </div>

      <section className={styles.tableSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Lista principal</h3>
          <p className={styles.sectionDescription}>
            {data?.totalElements ?? 0} exercicio(s) retornado(s) pelo endpoint.
          </p>
        </div>

        <div className={styles.tableWrap}>
          <Table columns={exerciseColumns}>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Nome</TableHeaderCell>
                <TableHeaderCell>Grupo muscular</TableHeaderCell>
                <TableHeaderCell>Descricao</TableHeaderCell>
                <TableHeaderCell center>Status</TableHeaderCell>
                <TableHeaderCell center>Acoes</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tableLoading && <TableSkeletonRows columns={5} />}

              {!tableLoading &&
                exercises.map((exercise) => {
                  const exerciseId = getExerciseId(exercise);

                  return (
                    <TableRow key={exerciseId || exercise.name}>
                      <TableCell>
                        <div className={styles.nameCell}>
                          <span className={styles.namePrimary}>
                            {exercise.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{exercise.muscleGroup || "-"}</TableCell>
                      <TableCell>
                        <span className={styles.nameSecondary}>
                          {exercise.description || "-"}
                        </span>
                      </TableCell>
                      <TableCell center>
                        <span
                          className={`${styles.statusBadge} ${
                            exercise.active === false
                              ? styles.statusInactive
                              : styles.statusActive
                          }`}
                        >
                          {exercise.active === false ? "Inativo" : "Ativo"}
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
                                  to: "/exercises/$exerciseId",
                                  params: { exerciseId },
                                }),
                            },
                            {
                              label: "Inativar",
                              icon: <Trash2 size={15} />,
                              danger: true,
                              disabled: !exerciseId,
                              onSelect: () => handleDelete(exerciseId),
                            },
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}

              {!tableLoading && exercises.length === 0 && (
                <TableEmptyState
                  colSpan={5}
                  message="Nenhum exercicio encontrado."
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
