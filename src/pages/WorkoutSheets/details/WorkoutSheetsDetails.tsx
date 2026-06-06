import { Autocomplete } from "@/components/Autocomplete/Autocomplete";
import { Button } from "@/components/Button/Button";
import { DetailLoadState } from "@/components/DetailLoadState/DetailLoadState";
import { Dropdown } from "@/components/Dropdown/Dropdown";
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
import { TextField } from "@/components/TextField/TextField";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useFormInputs } from "@/hooks/useFormInputs";
import { useCreateWorkoutSheetExercise } from "@/mutations/useCreateWorkoutSheetExercise";
import { useDeleteWorkoutSheetExercise } from "@/mutations/useDeleteWorkoutSheetExercise";
import { useUpdateWorkoutSheet } from "@/mutations/useUpdateWorkoutSheet";
import { useUpdateWorkoutSheetExercise } from "@/mutations/useUpdateWorkoutSheetExercise";
import type {
  WorkoutSheet,
  WorkoutSheetExercise,
  WorkoutSheetExerciseFormData,
  WorkoutSheetFormData,
} from "@/pages/WorkoutSheets/types";
import { useGetExercises } from "@/queries/useGetExercises";
import { useGetInstructors } from "@/queries/useGetInstructors";
import { useGetMyInstructor } from "@/queries/useGetMyInstructor";
import { useGetStudentOptions } from "@/queries/useGetStudentOptions";
import { useGetWorkoutSheetById } from "@/queries/useGetWorkoutSheetById";
import { useGetWorkoutSheetExercises } from "@/queries/useGetWorkoutSheetExercises";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ApiError } from "@/utils/apiError";
import { auth } from "@/utils/auth";
import styles from "./WorkoutSheetsDetails.module.css";

const EMPTY_SHEET_FORM: WorkoutSheetFormData = {
  studentId: "",
  instructorId: "",
  name: "",
  goal: "",
  startDate: "",
  endDate: "",
  notes: "",
  exercises: [],
};

const EMPTY_EXERCISE_FORM: WorkoutSheetExerciseFormData = {
  exerciseId: "",
  sets: "",
  repetitions: "",
  loadKg: "",
  restSeconds: "",
  trainingSection: "Treino A",
  executionOrder: "",
  notes: "",
};

const exerciseColumns = [
  { width: "20%" },
  { width: "14%" },
  { width: "12%" },
  { width: "14%" },
  { width: "14%" },
  { width: "18%" },
  { width: "10%" },
  { width: "12%" },
];

const getSheetExerciseId = (exercise: WorkoutSheetExercise) =>
  String(exercise.workoutSheetExerciseId);

const resolveExerciseName = (exercise: WorkoutSheetExercise) =>
  exercise.exerciseName ?? `Exercicio #${exercise.exerciseId}`;

const resolveExerciseId = (exercise: WorkoutSheetExercise) =>
  String(exercise.exerciseId);

const mapWorkoutSheetToForm = (
  details?: WorkoutSheet,
): WorkoutSheetFormData => ({
  studentId: String(details?.studentId ?? details?.student?.studentId ?? ""),
  instructorId: String(
    details?.instructorId ?? details?.instructor?.instructorId ?? "",
  ),
  name: details?.name ?? "",
  goal: details?.goal ?? "",
  startDate: details?.startDate ?? "",
  endDate: details?.endDate ?? "",
  notes: details?.notes ?? "",
  exercises:
    details?.exercises?.map((exercise) => ({
      exerciseId: String(exercise.exerciseId),
      sets: String(exercise.sets ?? ""),
      repetitions: exercise.repetitions ?? "",
      loadKg: String(exercise.loadKg ?? ""),
      restSeconds: String(exercise.restSeconds ?? ""),
      trainingSection: exercise.trainingSection ?? "Treino A",
      executionOrder: String(exercise.executionOrder ?? ""),
      notes: exercise.notes ?? "",
    })) ?? [],
});

type WorkoutSheetsDetailsContentProps = {
  details?: WorkoutSheet;
  isLoadingDetails: boolean;
  workoutSheetId?: string;
};

const focusById = (id: string) => {
  document.getElementById(id)?.focus();
};

const WorkoutSheetsDetailsContent = ({
  details,
  isLoadingDetails,
  workoutSheetId,
}: WorkoutSheetsDetailsContentProps) => {
  const isInstructor = auth.hasAnyRole(["INSTRUCTOR"]);
  const navigate = useNavigate();
  const [sheetForm, setSheetForm] = useState<WorkoutSheetFormData>(() =>
    details ? mapWorkoutSheetToForm(details) : EMPTY_SHEET_FORM,
  );
  const [exerciseForm, setExerciseForm] =
    useState<WorkoutSheetExerciseFormData>(EMPTY_EXERCISE_FORM);
  const [studentSearch, setStudentSearch] = useState(
    details?.student?.name ?? details?.studentName ?? "",
  );
  const [instructorSearch, setInstructorSearch] = useState(
    details?.instructor?.name ?? details?.instructorName ?? "",
  );
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [editingExerciseId, setEditingExerciseId] = useState("");
  const [exercisePage, setExercisePage] = useState(0);
  const [exerciseSize, setExerciseSize] = useState(10);
  const debouncedStudentSearch = useDebouncedValue(studentSearch);
  const debouncedInstructorSearch = useDebouncedValue(instructorSearch);
  const debouncedExerciseSearch = useDebouncedValue(exerciseSearch);
  const { set: setSheetField } = useFormInputs(setSheetForm);
  const { set: setExerciseField } = useFormInputs(setExerciseForm);
  const { data: studentOptions, isFetching: isFetchingStudents } =
    useGetStudentOptions(debouncedStudentSearch);
  const { data: me } = useGetMyInstructor(isInstructor);
  const { data: instructors, isFetching: isFetchingInstructors } =
    useGetInstructors(debouncedInstructorSearch, "ACTIVE", {
      size: 20,
      sort: "user.name,asc",
    }, !isInstructor);
  const { data: exercises, isFetching: isFetchingExercises } = useGetExercises(
    "active",
    debouncedExerciseSearch,
    {
      size: 20,
      sort: "name,asc",
    },
  );
  const {
    data: sheetExercises,
    isLoading: isLoadingSheetExercises,
    isFetching: isFetchingSheetExercises,
  } = useGetWorkoutSheetExercises(workoutSheetId, {
    page: exercisePage,
    size: exerciseSize,
    sort: "executionOrder,asc",
  });
  const { mutate: updateSheet, isPending: isUpdatingSheet } =
    useUpdateWorkoutSheet();
  const { mutate: createExercise, isPending: isCreatingExercise } =
    useCreateWorkoutSheetExercise();
  const { mutate: updateExercise, isPending: isUpdatingExercise } =
    useUpdateWorkoutSheetExercise();
  const { mutate: deleteExercise, isPending: isDeletingExercise } =
    useDeleteWorkoutSheetExercise();

  const exerciseRows = sheetExercises?.content ?? [];
  const isExerciseSubmitting = isCreatingExercise || isUpdatingExercise;
  const tableLoading = isLoadingSheetExercises || isFetchingSheetExercises;

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

  const exerciseOptions =
    exercises?.content.map((exercise) => ({
      label: exercise.name,
      value: String(exercise.exerciseId),
      description: exercise.muscleGroup,
    })) ?? [];
  const effectiveInstructorId = isInstructor
    ? String(me?.instructorId ?? "")
    : sheetForm.instructorId;
  const effectiveInstructorName = isInstructor ? (me?.name ?? "") : instructorSearch;

  const resetExerciseForm = () => {
    setExerciseForm(EMPTY_EXERCISE_FORM);
    setExerciseSearch("");
    setEditingExerciseId("");
  };

  const handleUpdateSheet = () => {
    const existingExercises =
      sheetForm.exercises.length > 0
        ? sheetForm.exercises
        : exerciseRows.map((exercise) => ({
            exerciseId: String(exercise.exerciseId),
            sets: String(exercise.sets ?? ""),
            repetitions: exercise.repetitions ?? "",
            loadKg: String(exercise.loadKg ?? ""),
            restSeconds: String(exercise.restSeconds ?? ""),
            trainingSection: exercise.trainingSection ?? "Treino A",
            executionOrder: String(exercise.executionOrder ?? ""),
            notes: exercise.notes ?? "",
          }));

    updateSheet(
      {
        id: String(workoutSheetId),
        data: {
          ...sheetForm,
          instructorId: effectiveInstructorId,
          exercises: existingExercises,
        },
      },
      {
        onSuccess: () => toast.success("Ficha atualizada com sucesso!"),
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

  const handleSubmitExercise = () => {
    if (!exerciseForm.exerciseId) {
      focusById("exerciseId");
      return;
    }

    if (!exerciseForm.sets) {
      focusById("sets");
      return;
    }

    if (!exerciseForm.repetitions) {
      focusById("repetitions");
      return;
    }

    if (!exerciseForm.trainingSection) {
      focusById("trainingSection");
      return;
    }

    if (!exerciseForm.executionOrder) {
      focusById("executionOrder");
      return;
    }

    const payload = {
      workoutSheetId: String(workoutSheetId),
      data: exerciseForm,
    };

    const callbacks = {
      onSuccess: () => {
        toast.success(
          editingExerciseId
            ? "Exercicio atualizado com sucesso!"
            : "Exercicio adicionado com sucesso!",
        );
        resetExerciseForm();
      },
      onError: (e: ApiError) => {
        toast.error(
          <div>
            <strong>{e?.error ?? "Erro"}</strong>
            <br />
            <span>{e?.message ?? "Erro inesperado"}</span>
          </div>,
        );
      },
    };

    if (editingExerciseId) {
      updateExercise(
        {
          id: editingExerciseId,
          ...payload,
        },
        callbacks,
      );
      return;
    }

    createExercise(payload, callbacks);
  };

  const handleEditExercise = (exercise: WorkoutSheetExercise) => {
    setEditingExerciseId(getSheetExerciseId(exercise));
    setExerciseForm({
      exerciseId: resolveExerciseId(exercise),
      sets: String(exercise.sets ?? ""),
      repetitions: String(exercise.repetitions ?? ""),
      loadKg: String(exercise.loadKg ?? ""),
      restSeconds: String(exercise.restSeconds ?? ""),
      trainingSection: exercise.trainingSection ?? "Treino A",
      executionOrder: String(exercise.executionOrder ?? ""),
      notes: exercise.notes ?? "",
    });
    setExerciseSearch(resolveExerciseName(exercise));
  };

  const handleDeleteExercise = (id: string) => {
    deleteExercise(
      { id, workoutSheetId: String(workoutSheetId) },
      {
        onSuccess: () => toast.success("Exercicio removido da ficha!"),
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
      <form
        className={styles.editorForm}
        onSubmit={(event) => {
          event.preventDefault();
          if (!isUpdatingSheet) handleUpdateSheet();
        }}
      >
        <section className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <h3 className={styles.sectionTitle}>Dados da ficha</h3>
              <p className={styles.sectionDescription}>
                Atualize aluno, instrutor, nome, objetivo e periodo da ficha.
              </p>
            </div>
          </div>

          {isLoadingDetails ? (
            <div className={styles.skeletonStack}>
              <Skeleton height="56px" />
              <Skeleton height="56px" />
              <Skeleton height="56px" />
            </div>
          ) : (
            <div className={styles.grid}>
              <Autocomplete
                label="Aluno"
                id="studentId"
                search={studentSearch}
                onSearchChange={(value) => {
                  setStudentSearch(value);
                  setSheetForm((prev) => ({ ...prev, studentId: "" }));
                }}
                onSelect={(option) => {
                  setStudentSearch(option.label);
                  setSheetForm((prev) => ({
                    ...prev,
                    studentId: option.value,
                  }));
                }}
                onClear={() => {
                  setStudentSearch("");
                  setSheetForm((prev) => ({ ...prev, studentId: "" }));
                }}
                options={autocompleteStudentOptions}
                loading={isFetchingStudents}
                placeholder="Digite o nome ou o CPF/e-mail completos"
              />
              {isInstructor ? (
                <TextField
                  label="Instrutor"
                  id="instructorId"
                  value={effectiveInstructorName}
                  onChange={() => undefined}
                  helperText={me?.email ?? undefined}
                  readOnly
                  disabled
                />
              ) : (
                <Autocomplete
                  label="Instrutor"
                  id="instructorId"
                  search={instructorSearch}
                  onSearchChange={(value) => {
                    setInstructorSearch(value);
                    setSheetForm((prev) => ({ ...prev, instructorId: "" }));
                  }}
                  onSelect={(option) => {
                    setInstructorSearch(option.label);
                    setSheetForm((prev) => ({
                      ...prev,
                      instructorId: option.value,
                    }));
                  }}
                  onClear={() => {
                    setInstructorSearch("");
                    setSheetForm((prev) => ({ ...prev, instructorId: "" }));
                  }}
                  options={instructorOptions}
                  loading={isFetchingInstructors}
                  placeholder="Digite nome, CREF ou e-mail completo"
                />
              )}
              <TextField
                label="Nome da ficha"
                id="name"
                value={sheetForm.name}
                onChange={setSheetField("name")}
              />
              <TextField
                label="Objetivo"
                id="goal"
                value={sheetForm.goal}
                onChange={setSheetField("goal")}
              />
              <TextField
                label="Data de inicio"
                id="startDate"
                type="date"
                value={sheetForm.startDate}
                onChange={setSheetField("startDate")}
              />
              <TextField
                label="Data de fim"
                id="endDate"
                type="date"
                value={sheetForm.endDate}
                onChange={setSheetField("endDate")}
              />
              <TextField
                label="Observações"
                id="notes"
                value={sheetForm.notes}
                onChange={setSheetField("notes")}
                containerProps={{ className: styles.fieldWide }}
              />
            </div>
          )}
        </section>

        {!isLoadingDetails && (
          <div className={styles.actions}>
            <Button
              type="button"
              onClick={() => navigate({ to: "/workout-sheets" })}
              disabled={isUpdatingSheet}
            >
              Voltar
            </Button>
            <Button
              type="submit"
              loading={isUpdatingSheet}
              disabled={
                !sheetForm.studentId ||
                !effectiveInstructorId ||
                !sheetForm.name ||
                (sheetForm.exercises.length === 0 && exerciseRows.length === 0)
              }
            >
              Salvar ficha
            </Button>
          </div>
        )}
      </form>

      <form
        className={styles.card}
        onSubmit={(event) => {
          event.preventDefault();
          if (!isExerciseSubmitting) handleSubmitExercise();
        }}
      >
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Exercicios da ficha</h3>
            <p className={styles.sectionDescription}>
              Adicione ou edite exercicio, bloco, series, repeticoes, descanso e ordem.
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          <Autocomplete
            label="Exercicio"
            id="exerciseId"
            search={exerciseSearch}
            onSearchChange={(value) => {
              setExerciseSearch(value);
              setExerciseForm((prev) => ({ ...prev, exerciseId: "" }));
            }}
            onSelect={(option) => {
              setExerciseSearch(option.label);
              setExerciseForm((prev) => ({
                ...prev,
                exerciseId: option.value,
              }));
            }}
            onClear={() => {
              setExerciseSearch("");
              setExerciseForm((prev) => ({ ...prev, exerciseId: "" }));
            }}
            options={exerciseOptions}
            loading={isFetchingExercises}
            placeholder="Digite o nome do exercicio"
          />
          <TextField
            label="Series"
            id="sets"
            type="number"
            value={exerciseForm.sets}
            onChange={setExerciseField("sets")}
          />
        </div>

        <div className={styles.grid}>
          <TextField
            label="Repeticoes"
            id="repetitions"
            value={exerciseForm.repetitions}
            onChange={setExerciseField("repetitions")}
            placeholder="10-12"
          />
          <TextField
            label="Bloco do treino"
            id="trainingSection"
            value={exerciseForm.trainingSection}
            onChange={setExerciseField("trainingSection")}
            placeholder="Treino A"
          />
        </div>

        <div className={styles.grid}>
          <TextField
            label="Descanso em segundos"
            id="restSeconds"
            type="number"
            value={exerciseForm.restSeconds}
            onChange={setExerciseField("restSeconds")}
          />
        </div>

        <div className={styles.grid}>
          <TextField
            label="Ordem"
            id="executionOrder"
            type="number"
            value={exerciseForm.executionOrder}
            onChange={setExerciseField("executionOrder")}
          />
          <TextField
            label="Observações do exercício"
            id="notes"
            value={exerciseForm.notes}
            onChange={setExerciseField("notes")}
            placeholder="Ajustes de execucao"
          />
        </div>

        <div className={styles.actions}>
          {editingExerciseId && (
            <Button
              type="button"
              onClick={resetExerciseForm}
              disabled={isExerciseSubmitting}
            >
              Cancelar edicao
            </Button>
          )}
          <Button type="submit" loading={isExerciseSubmitting}>
            {editingExerciseId ? "Salvar exercicio" : "Adicionar exercicio"}
          </Button>
        </div>
      </form>

      <section className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <h3 className={styles.sectionTitle}>Ordem da ficha</h3>
          <p className={styles.sectionDescription}>
            {sheetExercises?.totalElements ?? 0} exercicio(s) vinculados.
          </p>
        </div>

        <div className={styles.tableWrap}>
          <Table columns={exerciseColumns} minWidth="980px">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Exercicio</TableHeaderCell>
                <TableHeaderCell>Bloco</TableHeaderCell>
                <TableHeaderCell>Series</TableHeaderCell>
                <TableHeaderCell>Repeticoes</TableHeaderCell>
                <TableHeaderCell>Descanso</TableHeaderCell>
                <TableHeaderCell>Observações</TableHeaderCell>
                <TableHeaderCell center>Acoes</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tableLoading && <TableSkeletonRows columns={7} />}

              {!tableLoading &&
                exerciseRows.map((exercise) => {
                  const id = getSheetExerciseId(exercise);

                  return (
                    <TableRow key={id}>
                      <TableCell>
                        <div className={styles.nameCell}>
                          <span className={styles.namePrimary}>
                            {exercise.executionOrder}. {resolveExerciseName(exercise)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{exercise.trainingSection || "-"}</TableCell>
                      <TableCell>{exercise.sets}</TableCell>
                      <TableCell>{exercise.repetitions}</TableCell>
                      <TableCell>
                        {exercise.restSeconds ? `${exercise.restSeconds}s` : "-"}
                      </TableCell>
                      <TableCell>
                        <span className={styles.nameSecondary}>
                          {exercise.notes || "-"}
                        </span>
                      </TableCell>
                      <TableCell center>
                        <Dropdown
                          items={[
                            {
                              label: "Editar",
                              icon: <Pencil size={15} />,
                              onSelect: () => handleEditExercise(exercise),
                            },
                            {
                              label: "Remover",
                              icon: <Trash2 size={15} />,
                              danger: true,
                              disabled: isDeletingExercise || !id,
                              onSelect: () => handleDeleteExercise(id),
                            },
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}

              {!tableLoading && exerciseRows.length === 0 && (
                <TableEmptyState
                  colSpan={7}
                  message="Nenhum exercicio vinculado a esta ficha."
                />
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination
          page={sheetExercises}
          currentPage={exercisePage}
          loading={isFetchingSheetExercises}
          onPageChange={setExercisePage}
          onSizeChange={(nextSize) => {
            setExerciseSize(nextSize);
            setExercisePage(0);
          }}
        />
      </section>
    </div>
  );
};

export const WorkoutSheetsDetails = () => {
  const params = useParams({ strict: false });
  const workoutSheetId = params.workoutSheetId;
  const navigate = useNavigate();
  const {
    data: details,
    error,
    isError,
    isLoading: isLoadingDetails,
  } = useGetWorkoutSheetById(workoutSheetId);

  if (isLoadingDetails) {
    return (
      <DetailLoadState
        entity={{ name: "Ficha de treino", article: "esta", pronoun: "ela" }}
        loading
        onBack={() => navigate({ to: "/workout-sheets" })}
      />
    );
  }

  if (isError || (!isLoadingDetails && !details)) {
    return (
      <DetailLoadState
        entity={{ name: "Ficha de treino", article: "esta", pronoun: "ela" }}
        error={error}
        onBack={() => navigate({ to: "/workout-sheets" })}
      />
    );
  }

  return (
    <WorkoutSheetsDetailsContent
      key={`${workoutSheetId ?? "new"}-${details?.updatedAt ?? isLoadingDetails}`}
      details={details}
      isLoadingDetails={isLoadingDetails}
      workoutSheetId={workoutSheetId}
    />
  );
};

