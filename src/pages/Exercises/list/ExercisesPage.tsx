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
import { useDeleteExercise } from "@/mutations/useDeleteExercise";
import type { Exercise } from "@/pages/Exercises/types";
import { fetchExercises, useGetExercises } from "@/queries/useGetExercises";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Pencil, PlusCircle, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import styles from "./ExercisesPage.module.css";

const exerciseColumns = [
  { width: "32%" },
  { width: "24%" },
  { width: "34%" },
  { width: "10%" },
];

const getExerciseId = (exercise: Exercise) => String(exercise.exerciseId);

export const ExercisesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(
    null,
  );
  const debouncedSearch = useDebouncedValue(search);
  const queryMode = "active";

  const { data, isLoading, isFetching } = useGetExercises(
    queryMode,
    debouncedSearch,
    {
      page,
      size,
      sort: "name,asc",
    },
  );
  const { mutate: deleteExercise, isPending: isDeleting } = useDeleteExercise();
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
      queryFn: () => fetchExercises(queryMode, debouncedSearch, nextPagination),
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
    });
  }, [data, debouncedSearch, page, queryClient, queryMode, size]);

  const exercises = useMemo(() => data?.content ?? [], [data]);

  const handleDelete = () => {
    if (!exerciseToDelete) return;

    deleteExercise(
      { id: getExerciseId(exerciseToDelete) },
      {
        onSuccess: () => {
          toast.success("Exercício excluído com sucesso!");
          setExerciseToDelete(null);
        },
        onError: (e) => {
          toast.error(
            <div>
              <strong>{e?.error ?? "Erro"}</strong>
              <br />
              <span>{e?.message ?? "Erro inesperado"}</span>
            </div>,
          );
        },
      },
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <ListToolbar
          search={
            <SearchBar
              icon={<Search size={15} />}
              placeholder="Buscar por nome ou grupo muscular"
              containerClassName={styles.searchField}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          }
          action={
            <Button
              leftIcon={<PlusCircle size={18} />}
              onClick={() => navigate({ to: "/exercises/create" })}
            >
              Novo exercício
            </Button>
          }
        />
      </div>

      <section className={styles.tableSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Lista principal</h3>
          <p className={styles.sectionDescription}>
            {exercises.length} exercício(s) exibido(s) nesta página.
          </p>
        </div>

        <div className={styles.tableWrap}>
          <Table columns={exerciseColumns}>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Nome</TableHeaderCell>
                <TableHeaderCell>Grupo muscular</TableHeaderCell>
                <TableHeaderCell>Descrição</TableHeaderCell>
                <TableHeaderCell center>Ações</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tableLoading && <TableSkeletonRows columns={4} />}

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
                              label: "Excluir",
                              icon: <Trash2 size={15} />,
                              danger: true,
                              disabled: !exerciseId || isDeleting,
                              onSelect: () => setExerciseToDelete(exercise),
                            },
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}

              {!tableLoading && exercises.length === 0 && (
                <TableEmptyState
                  colSpan={4}
                  message="Nenhum exercício encontrado."
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
        open={!!exerciseToDelete}
        title="Excluir exercício?"
        description={
          exerciseToDelete
            ? `O exercício ${exerciseToDelete.name} será excluído. Confirme antes de continuar.`
            : ""
        }
        confirmLabel="Excluir exercício"
        loading={isDeleting}
        onCancel={() => setExerciseToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};


