import { Autocomplete } from "@/components/Autocomplete/Autocomplete";
import { Button } from "@/components/Button/Button";
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
import { useGetWorkoutSheets } from "@/queries/useGetWorkoutSheets";
import { useNavigate } from "@tanstack/react-router";
import { Eye, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
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
  const navigate = useNavigate();
  const [filterMode, setFilterMode] = useState<WorkoutSheetFilterMode>("all");
  const [studentId, setStudentId] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [onlyActive, setOnlyActive] = useState("false");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const debouncedStudentSearch = useDebouncedValue(studentSearch);

  const { data: studentOptions, isFetching: isFetchingStudents } =
    useGetStudentOptions(debouncedStudentSearch, filterMode === "student");
  const { data: instructors } = useGetInstructors("", {
    size: 100,
    sort: "user.name,asc",
  });

  const query =
    filterMode === "student"
      ? ({
          mode: "student",
          studentId,
          onlyActive: onlyActive === "true",
        } as const)
      : filterMode === "instructor"
        ? ({ mode: "instructor", instructorId } as const)
        : ({ mode: "all" } as const);

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
  const { mutate: deleteWorkoutSheet } = useDeleteWorkoutSheet();
  const tableLoading = isLoading || isFetching;
  const sheets = enabled ? (data?.content ?? []) : [];

  const autocompleteStudentOptions =
    studentOptions?.map((student) => ({
      label: student.label,
      value: String(student.studentId),
      description: student.email,
    })) ?? [];

  const instructorOptions = [
    { label: "Selecione um instrutor", value: "", disabled: true },
    ...(instructors?.content.map((instructor) => ({
      label: instructor.name,
      value: String(instructor.instructorId),
    })) ?? []),
  ];

  const handleDelete = (id: string) => {
    deleteWorkoutSheet(
      { id },
      {
        onSuccess: () => toast.success("Ficha inativada com sucesso!"),
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
        <div className={styles.topBarActions}>
          <SelectField
            label="Visao"
            id="workoutSheetFilterMode"
            value={filterMode}
            onChange={(e) => {
              setFilterMode(e.target.value as WorkoutSheetFilterMode);
              setStudentId("");
              setStudentSearch("");
              setInstructorId("");
              setPage(0);
            }}
            options={[
              { label: "Todas", value: "all" },
              { label: "Por aluno", value: "student" },
              { label: "Por instrutor", value: "instructor" },
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
            <SelectField
              label="Instrutor"
              id="workoutSheetInstructorFilter"
              value={instructorId}
              onChange={(e) => {
                setInstructorId(e.target.value);
                setPage(0);
              }}
              options={instructorOptions}
              containerProps={{ className: styles.filterFieldLarge }}
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
                <TableHeaderCell>Inicio</TableHeaderCell>
                <TableHeaderCell>Fim</TableHeaderCell>
                <TableHeaderCell center>Status</TableHeaderCell>
                <TableHeaderCell center>Acoes</TableHeaderCell>
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
                              disabled: !sheetId,
                              onSelect: () => handleDelete(sheetId),
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
    </div>
  );
};
