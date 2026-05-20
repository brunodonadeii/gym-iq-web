import { Autocomplete } from "@/components/Autocomplete/Autocomplete";
import { Button } from "@/components/Button/Button";
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
  WorkoutSheetExercise,
  WorkoutSheetExerciseFormData,
  WorkoutSheetFormData,
} from "@/pages/WorkoutSheets/types";
import { useGetExercises } from "@/queries/useGetExercises";
import { useGetInstructors } from "@/queries/useGetInstructors";
import { useGetStudentOptions } from "@/queries/useGetStudentOptions";
import { useGetWorkoutSheetById } from "@/queries/useGetWorkoutSheetById";
import { useGetWorkoutSheetExercises } from "@/queries/useGetWorkoutSheetExercises";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
  executionOrder: "",
  notes: "",
};

const exerciseColumns = [
  { width: "20%" },
  { width: "10%" },
  { width: "12%" },
  { width: "12%" },
  { width: "12%" },
  { width: "22%" },
  { width: "12%" },
];

const getSheetExerciseId = (exercise: WorkoutSheetExercise) =>
  String(exercise.workoutSheetExerciseId);

const resolveExerciseName = (exercise: WorkoutSheetExercise) =>
  exercise.exerciseName ??
  `Exercicio #${exercise.exerciseId}`;

const resolveExerciseId = (exercise: WorkoutSheetExercise) =>
  String(exercise.exerciseId);

export const WorkoutSheetsDetails = () => {
  const params = useParams({ strict: false });
  const workoutSheetId = params.workoutSheetId;
  const navigate = useNavigate();
  const [sheetForm, setSheetForm] =
    useState<WorkoutSheetFormData>(EMPTY_SHEET_FORM);
  const [exerciseForm, setExerciseForm] =
    useState<WorkoutSheetExerciseFormData>(EMPTY_EXERCISE_FORM);
  const [studentSearch, setStudentSearch] = useState("");
  const [instructorSearch, setInstructorSearch] = useState("");
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [editingExerciseId, setEditingExerciseId] = useState("");
  const [exercisePage, setExercisePage] = useState(0);
  const [exerciseSize, setExerciseSize] = useState(10);
  const debouncedStudentSearch = useDebouncedValue(studentSearch);
  const debouncedInstructorSearch = useDebouncedValue(instructorSearch);
  const debouncedExerciseSearch = useDebouncedValue(exerciseSearch);
  const { set: setSheetField } = useFormInputs(setSheetForm);
  const { set: setExerciseField } = useFormInputs(setExerciseForm);

  const { data: details, isLoading: isLoadingDetails } =
    useGetWorkoutSheetById(workoutSheetId);
  const { data: studentOptions, isFetching: isFetchingStudents } =
    useGetStudentOptions(debouncedStudentSearch);
  const { data: instructors, isFetching: isFetchingInstructors } =
    useGetInstructors(debouncedInstructorSearch, {
      size: 20,
      sort: "user.name,asc",
    });
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

  useEffect(() => {
    if (!details) return;

    setSheetForm({
      studentId: String(details.studentId ?? details.student?.studentId ?? ""),
      instructorId: String(
        details.instructorId ?? details.instructor?.instructorId ?? "",
      ),
      name: details.name ?? "",
      goal: details.goal ?? "",
      startDate: details.startDate ?? "",
      endDate: details.endDate ?? "",
      notes: details.notes ?? "",
      exercises:
        details.exercises?.map((exercise) => ({
          exerciseId: String(exercise.exerciseId),
          sets: String(exercise.sets ?? ""),
          repetitions: exercise.repetitions ?? "",
          loadKg: String(exercise.loadKg ?? ""),
          restSeconds: String(exercise.restSeconds ?? ""),
          executionOrder: String(exercise.executionOrder ?? ""),
          notes: exercise.notes ?? "",
        })) ?? [],
    });
    setStudentSearch(details.student?.name ?? details.studentName ?? "");
    setInstructorSearch(
      details.instructor?.name ?? details.instructorName ?? "",
    );
  }, [details]);

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
            executionOrder: String(exercise.executionOrder ?? ""),
            notes: exercise.notes ?? "",
          }));

    updateSheet(
      {
        id: String(workoutSheetId),
        data: {
          ...sheetForm,
          exercises: existingExercises,
        },
      },
      {
        onSuccess: () => toast.success("Ficha atualizada com sucesso!"),
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

  const handleSubmitExercise = () => {
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
      onError: (e: { erro?: string; mensagem?: string }) => {
        toast.error(
          <div>
            <strong>{e?.erro ?? "Erro"}</strong>
            <br />
            <span>{e?.mensagem ?? "Erro inesperado"}</span>
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
              placeholder="Digite nome, CPF ou e-mail"
            />
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
              placeholder="Digite nome, CREF ou e-mail"
            />
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
              label="Observacoes"
              id="notes"
              value={sheetForm.notes}
              onChange={setSheetField("notes")}
            />
          </div>
        )}
      </section>

      {!isLoadingDetails && (
        <div className={styles.actions}>
          <Button
            onClick={() => navigate({ to: "/workout-sheets" })}
            disabled={isUpdatingSheet}
          >
            Voltar
          </Button>
          <Button
            onClick={handleUpdateSheet}
            loading={isUpdatingSheet}
            disabled={
              !sheetForm.studentId ||
              !sheetForm.instructorId ||
              !sheetForm.name ||
              (sheetForm.exercises.length === 0 && exerciseRows.length === 0)
            }
          >
            Salvar ficha
          </Button>
        </div>
      )}

      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Exercicios da ficha</h3>
            <p className={styles.sectionDescription}>
              Adicione ou edite series, repeticoes, carga, descanso e ordem.
            </p>
          </div>
        </div>

        <div className={styles.compactGrid}>
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
          <TextField
            label="Repeticoes"
            id="repetitions"
            type="number"
            value={exerciseForm.repetitions}
            onChange={setExerciseField("repetitions")}
          />
          <TextField
            label="Carga"
            id="loadKg"
            type="number"
            value={exerciseForm.loadKg}
            onChange={setExerciseField("loadKg")}
            placeholder="40"
          />
          <TextField
            label="Descanso"
            id="restSeconds"
            type="number"
            value={exerciseForm.restSeconds}
            onChange={setExerciseField("restSeconds")}
            placeholder="60"
          />
          <TextField
            label="Ordem"
            id="executionOrder"
            type="number"
            value={exerciseForm.executionOrder}
            onChange={setExerciseField("executionOrder")}
          />
        </div>

        <div className={styles.grid}>
          <TextField
            label="Observacoes"
            id="notes"
            value={exerciseForm.notes}
            onChange={setExerciseField("notes")}
            placeholder="Ajustes de execucao"
          />
        </div>

        <div className={styles.actions}>
          {editingExerciseId && (
            <Button onClick={resetExerciseForm} disabled={isExerciseSubmitting}>
              Cancelar edicao
            </Button>
          )}
          <Button
            onClick={handleSubmitExercise}
            loading={isExerciseSubmitting}
            disabled={
              !exerciseForm.exerciseId ||
              !exerciseForm.sets ||
              !exerciseForm.repetitions ||
              !exerciseForm.executionOrder
            }
          >
            {editingExerciseId ? "Salvar exercicio" : "Adicionar exercicio"}
          </Button>
        </div>
      </section>

      <section className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <h3 className={styles.sectionTitle}>Ordem da ficha</h3>
          <p className={styles.sectionDescription}>
            {sheetExercises?.totalElements ?? 0} exercicio(s) vinculados.
          </p>
        </div>

        <div className={styles.tableWrap}>
          <Table columns={exerciseColumns} minWidth="1040px">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Exercicio</TableHeaderCell>
                <TableHeaderCell>Series</TableHeaderCell>
                <TableHeaderCell>Repeticoes</TableHeaderCell>
                <TableHeaderCell>Carga</TableHeaderCell>
                <TableHeaderCell>Descanso</TableHeaderCell>
                <TableHeaderCell>Observacoes</TableHeaderCell>
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
                            {exercise.executionOrder}.{" "}
                            {resolveExerciseName(exercise)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{exercise.sets}</TableCell>
                      <TableCell>{exercise.repetitions}</TableCell>
                      <TableCell>{exercise.loadKg ?? "-"}</TableCell>
                      <TableCell>
                        {exercise.restSeconds
                          ? `${exercise.restSeconds}s`
                          : "-"}
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
