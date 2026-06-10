import { Autocomplete } from "@/components/Autocomplete/Autocomplete";
import { Button } from "@/components/Button/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog/ConfirmDialog";
import { Dropdown } from "@/components/Dropdown/Dropdown";
import { ListToolbar } from "@/components/ListToolbar/ListToolbar";
import { Pagination } from "@/components/Pagination/Pagination";
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
import { useDeleteWorkoutSheet } from "@/mutations/useDeleteWorkoutSheet";
import { getStudentOptionLabel } from "@/pages/Students/types";
import type { WorkoutSheetSummary } from "@/pages/WorkoutSheets/types";
import { useGetInstructors } from "@/queries/useGetInstructors";
import { useGetStudentOptions } from "@/queries/useGetStudentOptions";
import {
  fetchWorkoutSheets,
  useGetWorkoutSheets,
} from "@/queries/useGetWorkoutSheets";
import { auth } from "@/utils/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Eye, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import styles from "./WorkoutSheetsPage.module.css";

type WorkoutSheetFilterMode = "all" | "student" | "instructor";
type WorkoutSheetStatusFilter = "all" | "active" | "inactive";

const sheetColumns = [
  { width: "20%" },
  { width: "18%" },
  { width: "18%" },
  { width: "18%" },
  { width: "9%" },
  { width: "9%" },
  { width: "8%" },
  { width: "6%" },
];

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "-";

const getWorkoutSheetId = (sheet: WorkoutSheetSummary) =>
  String(sheet.workoutSheetId);

const resolveStudentName = (sheet: WorkoutSheetSummary) =>
  sheet.student?.name ?? sheet.studentName ?? `Aluno #${sheet.studentId}`;

const resolveInstructorName = (sheet: WorkoutSheetSummary) =>
  sheet.instructor?.name ??
  sheet.instructorName ??
  `Instrutor #${sheet.instructorId}`;

export const WorkoutSheetsPage = () => {
  const isInstructor = auth.hasAnyRole(["INSTRUCTOR"]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filterMode, setFilterMode] = useState<WorkoutSheetFilterMode>("all");
  const [studentId, setStudentId] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [instructorSearch, setInstructorSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<WorkoutSheetStatusFilter>("all");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sheetToDelete, setSheetToDelete] =
    useState<WorkoutSheetSummary | null>(null);
  const debouncedStudentSearch = useDebouncedValue(studentSearch);
  const debouncedInstructorSearch = useDebouncedValue(instructorSearch);

  const {
    data: studentOptions,
    isFetching: isFetchingStudents,
    isFetchingNextPage: isFetchingMoreStudents,
    hasNextPage: hasMoreStudents,
    fetchNextPage: fetchMoreStudents,
  } =
    useGetStudentOptions(debouncedStudentSearch, filterMode === "student");
  const { data: instructors, isFetching: isFetchingInstructors } =
    useGetInstructors(
      debouncedInstructorSearch,
      "ACTIVE",
      {
        size: 20,
        sort: "user.name,asc",
      },
      !isInstructor,
    );

  const query = useMemo(
    () =>
      filterMode === "student"
        ? ({
            mode: "student",
            studentId,
            onlyActive: statusFilter === "active",
          } as const)
        : filterMode === "instructor"
          ? ({ mode: "instructor", instructorId } as const)
          : ({ mode: "all" } as const),
    [filterMode, instructorId, statusFilter, studentId],
  );

  const enabled =
    filterMode === "student"
      ? studentId !== ""
      : filterMode === "instructor"
        ? instructorId !== ""
        : true;

  const { data, isLoading, isFetching } = useGetWorkoutSheets(query, enabled, {
    page,
    size,
    sort: "createdAt,desc",
  });
  const { mutate: deleteWorkoutSheet, isPending: isDeleting } =
    useDeleteWorkoutSheet();
  const tableLoading = isLoading;
  const sheets = (enabled ? (data?.content ?? []) : []).filter((sheet) =>
    statusFilter === "active"
      ? sheet.active
      : statusFilter === "inactive"
        ? !sheet.active
        : true,
  );

  useEffect(() => {
    if (!enabled || !data || data.last) return;

    const nextPagination = {
      page: page + 1,
      size,
      sort: "createdAt,desc",
    };

    queryClient.prefetchQuery({
      queryKey: ["workout-sheets", query, nextPagination],
      queryFn: () => fetchWorkoutSheets(query, nextPagination),
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
    });
  }, [data, enabled, page, query, queryClient, size]);

  const autocompleteStudentOptions =
    studentOptions?.map((student) => ({
      label: getStudentOptionLabel(student),
      value: String(student.studentId),
      description: student.email,
    })) ?? [];

  const instructorOptions =
    instructors?.content.map((instructor) => ({
      label: instructor.name,
      value: String(instructor.instructorId),
      description: instructor.email,
    })) ?? [];

  const handleDelete = () => {
    if (!sheetToDelete) return;

    deleteWorkoutSheet(
      { id: getWorkoutSheetId(sheetToDelete) },
      {
        onSuccess: () => {
          toast.success("Ficha inativada com sucesso!");
          setSheetToDelete(null);
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
            filterMode === "student" ? (
              <Autocomplete
                label="Aluno"
                id="workoutSheetStudentFilter"
                search={studentSearch}
                onSearchChange={(value) => {
                  setStudentSearch(value);
                  setStudentId("");
                  setPage(0);
                }}
                onSelect={(option) => {
                  setStudentSearch(option.label);
                  setStudentId(option.value);
                  setPage(0);
                }}
                onClear={() => {
                  setStudentSearch("");
                  setStudentId("");
                  setPage(0);
                }}
                options={autocompleteStudentOptions}
                loading={
                  isFetchingStudents && autocompleteStudentOptions.length === 0
                }
                loadingMore={isFetchingMoreStudents}
                hasMoreOptions={Boolean(hasMoreStudents)}
                onLoadMore={() => void fetchMoreStudents()}
                placeholder="Digite o nome ou o CPF/e-mail completos"
                containerClassName={styles.filterFieldLarge}
              />
            ) : filterMode === "instructor" ? (
              <Autocomplete
                label="Instrutor"
                id="workoutSheetInstructorFilter"
                search={instructorSearch}
                onSearchChange={(value) => {
                  setInstructorSearch(value);
                  setInstructorId("");
                  setPage(0);
                }}
                onSelect={(option) => {
                  setInstructorSearch(option.label);
                  setInstructorId(option.value);
                  setPage(0);
                }}
                onClear={() => {
                  setInstructorSearch("");
                  setInstructorId("");
                  setPage(0);
                }}
                options={instructorOptions}
                loading={isFetchingInstructors}
                placeholder="Digite nome, CREF ou e-mail completo"
                containerClassName={styles.filterFieldLarge}
              />
            ) : undefined
          }
          filters={
            <>
              <SelectField
                label="Visão"
                id="workoutSheetFilterMode"
                value={filterMode}
                onChange={(e) => {
                  setFilterMode(e.target.value as WorkoutSheetFilterMode);
                  setStudentId("");
                  setStudentSearch("");
                  setInstructorId("");
                  setInstructorSearch("");
                  setPage(0);
                }}
                options={[
                  { label: "Todas", value: "all" },
                  { label: "Por aluno", value: "student" },
                  ...(!isInstructor
                    ? [{ label: "Por instrutor", value: "instructor" as const }]
                    : []),
                ]}
                containerProps={{ className: styles.filterField }}
              />
              <SelectField
                label="Status"
                id="workoutSheetStatusFilter"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as WorkoutSheetStatusFilter);
                  setPage(0);
                }}
                options={[
                  { label: "Todas", value: "all" },
                  { label: "Ativas", value: "active" },
                  { label: "Inativas", value: "inactive" },
                ]}
                containerProps={{ className: styles.filterField }}
              />
            </>
          }
          action={
            <Button
              leftIcon={<PlusCircle size={18} />}
              onClick={() => navigate({ to: "/workout-sheets/create" })}
            >
              Nova ficha
            </Button>
          }
        />
      </div>

      <section className={styles.tableSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Lista principal</h3>
          <p className={styles.sectionDescription}>
            {sheets.length} ficha(s) exibida(s) nesta página.
          </p>
        </div>

        <div className={styles.tableWrap}>
          <Table columns={sheetColumns} minWidth="1060px">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Aluno</TableHeaderCell>
                <TableHeaderCell>Instrutor</TableHeaderCell>
                <TableHeaderCell>Ficha</TableHeaderCell>
                <TableHeaderCell>Objetivo</TableHeaderCell>
                <TableHeaderCell>Início</TableHeaderCell>
                <TableHeaderCell>Fim</TableHeaderCell>
                <TableHeaderCell center>Status</TableHeaderCell>
                <TableHeaderCell center>Ações</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tableLoading && <TableSkeletonRows columns={8} />}

              {!tableLoading &&
                sheets.map((sheet) => {
                  const sheetId = getWorkoutSheetId(sheet);

                  return (
                    <TableRow key={sheetId}>
                      <TableCell>
                        <div className={styles.nameCell}>
                          <span className={styles.namePrimary}>
                            {resolveStudentName(sheet)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{resolveInstructorName(sheet)}</TableCell>
                      <TableCell>{sheet.name}</TableCell>
                      <TableCell>{sheet.goal || "-"}</TableCell>
                      <TableCell>{formatDate(sheet.startDate)}</TableCell>
                      <TableCell>{formatDate(sheet.endDate)}</TableCell>
                      <TableCell center>
                        <span
                          className={`${styles.statusBadge} ${
                            sheet.active
                              ? styles.statusActive
                              : styles.statusInactive
                          }`}
                        >
                          {sheet.active ? "Ativa" : "Inativa"}
                        </span>
                      </TableCell>
                      <TableCell center>
                        <Dropdown
                          items={[
                            {
                              label: "Ver detalhes",
                              icon: <Eye size={15} />,
                              disabled: !sheetId,
                              onSelect: () =>
                                navigate({
                                  to: "/workout-sheets/$workoutSheetId",
                                  params: { workoutSheetId: sheetId },
                                }),
                            },
                            {
                              label: "Editar",
                              icon: <Pencil size={15} />,
                              disabled: !sheetId,
                              onSelect: () =>
                                navigate({
                                  to: "/workout-sheets/$workoutSheetId/edit",
                                  params: { workoutSheetId: sheetId },
                                }),
                            },
                            {
                              label: "Inativar",
                              icon: <Trash2 size={15} />,
                              danger: true,
                              disabled: !sheetId || isDeleting,
                              onSelect: () => setSheetToDelete(sheet),
                            },
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}

              {!tableLoading && sheets.length === 0 && (
                <TableEmptyState
                  colSpan={8}
                  message="Nenhuma ficha encontrada."
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
        open={!!sheetToDelete}
        title="Inativar ficha?"
        description={
          sheetToDelete
            ? (
                <>
                  A ficha <strong>{sheetToDelete.name}</strong> de{" "}
                  <strong>{resolveStudentName(sheetToDelete)}</strong> será{" "}
                  <strong>inativada</strong>.
                </>
              )
            : ""
        }
        confirmLabel="Inativar ficha"
        loading={isDeleting}
        onCancel={() => setSheetToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
