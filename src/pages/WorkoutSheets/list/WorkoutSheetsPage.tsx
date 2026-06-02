import { Autocomplete } from "@/components/Autocomplete/Autocomplete";
import { Button } from "@/components/Button/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog/ConfirmDialog";
import { Dropdown } from "@/components/Dropdown/Dropdown";
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
import type { WorkoutSheet } from "@/pages/WorkoutSheets/types";
import { useGetInstructors } from "@/queries/useGetInstructors";
import { useGetStudentOptions } from "@/queries/useGetStudentOptions";
import {
  fetchWorkoutSheets,
  useGetWorkoutSheets,
} from "@/queries/useGetWorkoutSheets";
import { auth } from "@/utils/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Eye, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import styles from "./WorkoutSheetsPage.module.css";

type WorkoutSheetFilterMode = "all" | "student" | "instructor";

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

const getWorkoutSheetId = (sheet: WorkoutSheet) =>
  String(sheet.workoutSheetId);

const resolveStudentName = (sheet: WorkoutSheet) =>
  sheet.student?.name ?? sheet.studentName ?? `Aluno #${sheet.studentId}`;

const resolveStudentEmail = (sheet: WorkoutSheet) =>
  sheet.student?.email ?? sheet.studentEmail ?? "";

const resolveInstructorName = (sheet: WorkoutSheet) =>
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
  const [onlyActive, setOnlyActive] = useState("false");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sheetToDelete, setSheetToDelete] = useState<WorkoutSheet | null>(null);
  const debouncedStudentSearch = useDebouncedValue(studentSearch);
  const debouncedInstructorSearch = useDebouncedValue(instructorSearch);

  const { data: studentOptions, isFetching: isFetchingStudents } =
    useGetStudentOptions(debouncedStudentSearch, filterMode === "student");
  const { data: instructors, isFetching: isFetchingInstructors } =
    useGetInstructors(debouncedInstructorSearch, "ACTIVE", {
      size: 20,
      sort: "user.name,asc",
    }, !isInstructor);

  const query = useMemo(
    () =>
      filterMode === "student"
        ? ({
            mode: "student",
            studentId,
            onlyActive: onlyActive === "true",
          } as const)
        : filterMode === "instructor"
          ? ({ mode: "instructor", instructorId } as const)
          : ({ mode: "all" } as const),
    [filterMode, instructorId, onlyActive, studentId],
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
  const sheets = enabled ? (data?.content ?? []) : [];

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
      label: student.label,
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
              <strong>{e?.erro ?? e?.error ?? "Erro"}</strong>
              <br />
              <span>{e?.mensagem ?? e?.message ?? "Erro inesperado"}</span>
            </div>,
          );
        },
      },
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.topBarActions}>
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

          {filterMode === "student" && (
            <>
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
                loading={isFetchingStudents}
                placeholder="Digite nome, CPF ou e-mail"
                containerClassName={styles.filterFieldLarge}
              />
              <SelectField
                label="Status"
                id="workoutSheetOnlyActive"
                value={onlyActive}
                onChange={(e) => {
                  setOnlyActive(e.target.value);
                  setPage(0);
                }}
                options={[
                  { label: "Todas", value: "false" },
                  { label: "Somente ativas", value: "true" },
                ]}
                containerProps={{ className: styles.filterField }}
              />
            </>
          )}

          {filterMode === "instructor" && (
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
              placeholder="Digite nome, CREF ou e-mail"
              containerClassName={styles.filterFieldLarge}
            />
          )}
        </div>

        <Button
          leftIcon={<PlusCircle size={18} />}
          onClick={() => navigate({ to: "/workout-sheets/create" })}
        >
          Nova ficha
        </Button>
      </div>

      <section className={styles.tableSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Lista principal</h3>
          <p className={styles.sectionDescription}>
            {data?.totalElements ?? 0} ficha(s) retornada(s) pelo endpoint.
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
                          {resolveStudentEmail(sheet) && (
                            <span className={styles.nameSecondary}>
                              {resolveStudentEmail(sheet)}
                            </span>
                          )}
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
                              label: "Detalhes",
                              icon: <Eye size={15} />,
                              disabled: !sheetId,
                              onSelect: () =>
                                navigate({
                                  to: "/workout-sheets/$workoutSheetId",
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
            ? `A ficha ${sheetToDelete.name} de ${resolveStudentName(sheetToDelete)} deixará de ficar ativa.`
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

