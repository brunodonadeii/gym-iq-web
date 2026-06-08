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
import { useCreateWorkoutBlock } from "@/mutations/useCreateWorkoutBlock";
import { useCreateWorkoutSheetExercise } from "@/mutations/useCreateWorkoutSheetExercise";
import { useDeleteWorkoutSheetExercise } from "@/mutations/useDeleteWorkoutSheetExercise";
import { useUpdateWorkoutSheet } from "@/mutations/useUpdateWorkoutSheet";
import { useUpdateWorkoutSheetExercise } from "@/mutations/useUpdateWorkoutSheetExercise";
import type {
  WorkoutSheet,
  WorkoutBlock,
  WorkoutSheetExercise,
  WorkoutSheetExerciseFormData,
  WorkoutSheetFormData,
} from "@/pages/WorkoutSheets/types";
import {
  validateWorkoutSheetExercise,
  WORKOUT_SHEET_EXERCISE_LIMITS,
  type WorkoutSheetExerciseFormErrors,
} from "@/pages/WorkoutSheets/validation";
import { useGetExercises } from "@/queries/useGetExercises";
import { useGetInstructors } from "@/queries/useGetInstructors";
import { useGetMyInstructor } from "@/queries/useGetMyInstructor";
import { useGetStudentOptions } from "@/queries/useGetStudentOptions";
import { useGetWorkoutSheetById } from "@/queries/useGetWorkoutSheetById";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ApiError } from "@/utils/apiError";
import { getApiFieldErrors } from "@/utils/apiError";
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
  blocks: [],
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

const DEFAULT_TRAINING_SECTIONS = ["Treino A", "Treino B", "Treino C"];

type SheetFormField = Exclude<keyof WorkoutSheetFormData, "exercises">;
type SheetFormErrors = Partial<Record<SheetFormField, string>>;
type ExerciseFormErrors = WorkoutSheetExerciseFormErrors;

const SHEET_FIELDS = [
  "studentId",
  "instructorId",
  "name",
  "goal",
  "startDate",
  "endDate",
  "notes",
] as const;

const EXERCISE_FIELDS = [
  "exerciseId",
  "sets",
  "repetitions",
  "loadKg",
  "restSeconds",
  "trainingSection",
  "executionOrder",
  "notes",
] as const;

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
  exercise.exerciseName ?? `Exercício #${exercise.exerciseId}`;

const resolveExerciseId = (exercise: WorkoutSheetExercise) =>
  String(exercise.exerciseId);

const getInitialTrainingSections = (details?: WorkoutSheet) => {
  const sections = details?.blocks?.length
    ? details.blocks
        .map((block) => block.name)
        .filter((section): section is string => Boolean(section?.trim()))
    : details?.exercises
    ?.map((exercise) => exercise.trainingSection)
    .filter((section): section is string => Boolean(section?.trim()));

  return sections?.length ? Array.from(new Set(sections)) : DEFAULT_TRAINING_SECTIONS;
};

const getWorkoutBlockId = (block?: WorkoutBlock) =>
  String(block?.workoutBlockId ?? block?.blockId ?? block?.id ?? "");

const getWorkoutSheetBlocks = (details?: WorkoutSheet): WorkoutBlock[] => {
  if (details?.blocks?.length) return details.blocks;

  const legacyExercises = details?.exercises ?? [];
  const groups = new Map<string, WorkoutSheetExercise[]>();

  legacyExercises.forEach((exercise) => {
    const section = exercise.trainingSection?.trim() || "Treino";
    groups.set(section, [...(groups.get(section) ?? []), exercise]);
  });

  return Array.from(groups.entries()).map(([name, exercises], index) => ({
    name,
    description: null,
    executionOrder: index + 1,
    exercises,
  }));
};

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
  blocks:
    details?.blocks?.map((block, blockIndex) => ({
      name: block.name,
      description: block.description ?? "",
      executionOrder: String(block.executionOrder ?? blockIndex + 1),
      exercises:
        block.exercises?.map((exercise) => ({
          exerciseId: String(exercise.exerciseId),
          sets: String(exercise.sets ?? ""),
          repetitions: exercise.repetitions ?? "",
          loadKg: String(exercise.loadKg ?? ""),
          restSeconds: String(exercise.restSeconds ?? ""),
          trainingSection: "",
          executionOrder: String(exercise.executionOrder ?? ""),
          notes: exercise.notes ?? "",
        })) ?? [],
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
  const [sheetErrors, setSheetErrors] = useState<SheetFormErrors>({});
  const [exerciseErrors, setExerciseErrors] =
    useState<ExerciseFormErrors>({});
  const [studentSearch, setStudentSearch] = useState(
    details?.student?.name ?? details?.studentName ?? "",
  );
  const [instructorSearch, setInstructorSearch] = useState(
    details?.instructor?.name ?? details?.instructorName ?? "",
  );
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [editingExerciseId, setEditingExerciseId] = useState("");
  const [trainingSections, setTrainingSections] = useState(() =>
    getInitialTrainingSections(details),
  );
  const [activeTrainingSection, setActiveTrainingSection] = useState(
    () => getInitialTrainingSections(details)[0] ?? "Treino A",
  );
  const [newTrainingSection, setNewTrainingSection] = useState("");
  const [newTrainingSectionDescription, setNewTrainingSectionDescription] =
    useState("");
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
  const workoutBlocks = getWorkoutSheetBlocks(details);
  const activeBlock =
    workoutBlocks.find((block) => block.name === activeTrainingSection) ??
    workoutBlocks[0];
  const activeWorkoutBlockId = getWorkoutBlockId(activeBlock);
  const blockExerciseRows = workoutBlocks
    .flatMap((block) =>
      (block.exercises ?? []).map((exercise) => ({
        ...exercise,
        trainingSection: block.name,
      })),
    )
    .sort((a, b) => Number(a.executionOrder ?? 0) - Number(b.executionOrder ?? 0));
  const { mutate: updateSheet, isPending: isUpdatingSheet } =
    useUpdateWorkoutSheet();
  const { mutate: createBlock, isPending: isCreatingBlock } =
    useCreateWorkoutBlock();
  const { mutate: createExercise, isPending: isCreatingExercise } =
    useCreateWorkoutSheetExercise();
  const { mutate: updateExercise, isPending: isUpdatingExercise } =
    useUpdateWorkoutSheetExercise();
  const { mutate: deleteExercise, isPending: isDeletingExercise } =
    useDeleteWorkoutSheetExercise();

  const exerciseRows = blockExerciseRows.slice(
    exercisePage * exerciseSize,
    exercisePage * exerciseSize + exerciseSize,
  );
  const exercisePageData = {
    content: exerciseRows,
    totalElements: blockExerciseRows.length,
    totalPages: Math.ceil(blockExerciseRows.length / exerciseSize),
    size: exerciseSize,
    number: exercisePage,
    first: exercisePage === 0,
    last:
      blockExerciseRows.length === 0 ||
      exercisePage >= Math.ceil(blockExerciseRows.length / exerciseSize) - 1,
  };
  const isExerciseSubmitting = isCreatingExercise || isUpdatingExercise;
  const tableLoading = false;

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
    setExerciseErrors({});
    setExerciseSearch("");
    setEditingExerciseId("");
  };

  const handleAddTrainingSection = () => {
    const nextSection = newTrainingSection.trim();
    if (!nextSection) return;

    createBlock(
      {
        workoutSheetId: String(workoutSheetId),
        data: {
          name: nextSection,
          description: newTrainingSectionDescription.trim(),
          executionOrder: workoutBlocks.length + 1,
        },
      },
      {
        onSuccess: () => {
          toast.success("Bloco criado com sucesso!");
          setTrainingSections((prev) =>
            prev.includes(nextSection) ? prev : [...prev, nextSection],
          );
          setActiveTrainingSection(nextSection);
          setNewTrainingSection("");
          setNewTrainingSectionDescription("");
        },
        onError: (e) => {
          toast.error(
            <div>
              <strong>{e?.error ?? "Erro"}</strong>
              <br />
              <span>{e?.message ?? "Não foi possível criar o bloco."}</span>
            </div>,
          );
        },
      },
    );
  };

  const handleUpdateSheet = () => {
    updateSheet(
      {
        id: String(workoutSheetId),
        data: {
          ...sheetForm,
          instructorId: effectiveInstructorId,
        },
      },
      {
        onSuccess: () => toast.success("Ficha atualizada com sucesso!"),
        onError: (e) => {
          const fieldErrors = getApiFieldErrors(e, SHEET_FIELDS);
          if (fieldErrors) {
            setSheetErrors(fieldErrors);
            focusById(Object.keys(fieldErrors)[0]);
            return;
          }

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
    const nextExerciseErrors = validateWorkoutSheetExercise({
      ...exerciseForm,
      trainingSection: activeTrainingSection,
    });

    if (Object.keys(nextExerciseErrors).length > 0) {
      setExerciseErrors(nextExerciseErrors);
      const firstField = Object.keys(nextExerciseErrors)[0];
      focusById(firstField === "trainingSection" ? "newTrainingSection" : firstField);
      return;
    }

    if (!activeWorkoutBlockId) {
      toast.error("Crie ou selecione um bloco antes de adicionar exercícios.");
      focusById("newTrainingSection");
      return;
    }

    const payload = {
      workoutSheetId: String(workoutSheetId),
      workoutBlockId: activeWorkoutBlockId || undefined,
      data: {
        ...exerciseForm,
        trainingSection: "",
      },
    };

    const callbacks = {
      onSuccess: () => {
        toast.success(
          editingExerciseId
            ? "Exercício atualizado com sucesso!"
            : "Exercício adicionado com sucesso!",
        );
        resetExerciseForm();
      },
      onError: (e: ApiError) => {
        const fieldErrors = getApiFieldErrors(e, EXERCISE_FIELDS);
        if (fieldErrors) {
          setExerciseErrors(fieldErrors);
          focusById(Object.keys(fieldErrors)[0]);
          return;
        }

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
    const sectionName = exercise.trainingSection ?? "Treino A";

    setEditingExerciseId(getSheetExerciseId(exercise));
    setExerciseForm({
      exerciseId: resolveExerciseId(exercise),
      sets: String(exercise.sets ?? ""),
      repetitions: String(exercise.repetitions ?? ""),
      loadKg: String(exercise.loadKg ?? ""),
      restSeconds: String(exercise.restSeconds ?? ""),
      trainingSection: sectionName,
      executionOrder: String(exercise.executionOrder ?? ""),
      notes: exercise.notes ?? "",
    });
    setActiveTrainingSection(sectionName);
    setTrainingSections((prev) =>
      prev.includes(sectionName) ? prev : [...prev, sectionName],
    );
    setExerciseSearch(resolveExerciseName(exercise));
  };

  const handleDeleteExercise = (id: string) => {
    deleteExercise(
      { id, workoutSheetId: String(workoutSheetId) },
      {
        onSuccess: () => toast.success("Exercício removido da ficha!"),
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
        noValidate
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
                  setSheetErrors((prev) => ({
                    ...prev,
                    studentId: undefined,
                  }));
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
                required
                error={sheetErrors.studentId}
              />
              {isInstructor ? (
                <TextField
                  label="Instrutor"
                  id="instructorId"
                  value={effectiveInstructorName}
                  onChange={() => undefined}
                  helperText={me?.email ?? undefined}
                  error={sheetErrors.instructorId}
                  readOnly
                  disabled
                  required
                />
              ) : (
                <Autocomplete
                  label="Instrutor"
                  id="instructorId"
                  search={instructorSearch}
                  onSearchChange={(value) => {
                    setInstructorSearch(value);
                    setSheetForm((prev) => ({ ...prev, instructorId: "" }));
                    setSheetErrors((prev) => ({
                      ...prev,
                      instructorId: undefined,
                    }));
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
                  required
                  error={sheetErrors.instructorId}
                />
              )}
              <TextField
                label="Nome da ficha"
                id="name"
                value={sheetForm.name}
                onChange={(event) => {
                  setSheetField("name")(event);
                  setSheetErrors((prev) => ({ ...prev, name: undefined }));
                }}
                required
                error={sheetErrors.name}
              />
              <TextField
                label="Objetivo"
                id="goal"
                value={sheetForm.goal}
                onChange={(event) => {
                  setSheetField("goal")(event);
                  setSheetErrors((prev) => ({ ...prev, goal: undefined }));
                }}
                optional
                error={sheetErrors.goal}
              />
              <TextField
                label="Data de inicio"
                id="startDate"
                type="date"
                value={sheetForm.startDate}
                onChange={(event) => {
                  setSheetField("startDate")(event);
                  setSheetErrors((prev) => ({
                    ...prev,
                    startDate: undefined,
                  }));
                }}
                optional
                error={sheetErrors.startDate}
              />
              <TextField
                label="Data de fim"
                id="endDate"
                type="date"
                value={sheetForm.endDate}
                onChange={(event) => {
                  setSheetField("endDate")(event);
                  setSheetErrors((prev) => ({ ...prev, endDate: undefined }));
                }}
                optional
                error={sheetErrors.endDate}
              />
              <TextField
                label="Observações"
                id="notes"
                value={sheetForm.notes}
                onChange={(event) => {
                  setSheetField("notes")(event);
                  setSheetErrors((prev) => ({ ...prev, notes: undefined }));
                }}
                containerProps={{ className: styles.fieldWide }}
                optional
                error={sheetErrors.notes}
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
                (sheetForm.blocks.length === 0 && blockExerciseRows.length === 0)
              }
            >
              Salvar ficha
            </Button>
          </div>
        )}
      </form>

      <form
        className={styles.card}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!isExerciseSubmitting) handleSubmitExercise();
        }}
      >
        <div className={styles.sectionHeader}>
          <div>
              <h3 className={styles.sectionTitle}>Exercícios da ficha</h3>
            <p className={styles.sectionDescription}>
              Escolha um bloco e adicione os exercícios dentro dele.
            </p>
          </div>
        </div>

        <div className={styles.trainingSectionPanel}>
          <div className={styles.trainingSectionList}>
            {trainingSections.map((section) => (
              <button
                key={section}
                type="button"
                className={`${styles.trainingSectionTab} ${
                  activeTrainingSection === section
                    ? styles.trainingSectionTabActive
                    : ""
                }`}
                onClick={() => setActiveTrainingSection(section)}
              >
                {section}
              </button>
            ))}
          </div>

          <div className={styles.trainingSectionForm}>
            <TextField
              label="Novo bloco"
              id="newTrainingSection"
              value={newTrainingSection}
              onChange={(event) => setNewTrainingSection(event.target.value)}
              placeholder="Treino D"
              optional
            />
            <TextField
              label="Descrição"
              id="newTrainingSectionDescription"
              value={newTrainingSectionDescription}
              onChange={(event) =>
                setNewTrainingSectionDescription(event.target.value)
              }
              placeholder="Peito, ombro e tríceps"
              optional
            />
            <Button
              type="button"
              variant="secondary"
              leftIcon={<PlusCircle size={18} />}
              onClick={handleAddTrainingSection}
              disabled={!newTrainingSection.trim() || isCreatingBlock}
            >
              Adicionar bloco
            </Button>
          </div>
        </div>

        <div className={styles.grid}>
          <Autocomplete
            label="Exercício"
            id="exerciseId"
            search={exerciseSearch}
            onSearchChange={(value) => {
              setExerciseSearch(value);
              setExerciseForm((prev) => ({ ...prev, exerciseId: "" }));
              setExerciseErrors((prev) => ({
                ...prev,
                exerciseId: undefined,
              }));
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
            placeholder="Digite o nome do exercício"
            required
            error={exerciseErrors.exerciseId}
          />
          <TextField
            label="Series"
            id="sets"
            type="number"
            min={WORKOUT_SHEET_EXERCISE_LIMITS.sets.min}
            max={WORKOUT_SHEET_EXERCISE_LIMITS.sets.max}
            value={exerciseForm.sets}
            onChange={(event) => {
              setExerciseField("sets")(event);
              setExerciseErrors((prev) => ({ ...prev, sets: undefined }));
            }}
            required
            error={exerciseErrors.sets}
          />
        </div>

        <div className={styles.grid}>
          <TextField
            label="Repeticoes"
            id="repetitions"
            value={exerciseForm.repetitions}
            onChange={(event) => {
              setExerciseField("repetitions")(event);
              setExerciseErrors((prev) => ({
                ...prev,
                repetitions: undefined,
              }));
            }}
            placeholder="10-12"
            required
            error={exerciseErrors.repetitions}
          />
        </div>

        <div className={styles.grid}>
          <TextField
            label="Descanso em segundos"
            id="restSeconds"
            type="number"
            min={WORKOUT_SHEET_EXERCISE_LIMITS.restSeconds.min}
            max={WORKOUT_SHEET_EXERCISE_LIMITS.restSeconds.max}
            value={exerciseForm.restSeconds}
            onChange={(event) => {
              setExerciseField("restSeconds")(event);
              setExerciseErrors((prev) => ({
                ...prev,
                restSeconds: undefined,
              }));
            }}
            optional
            error={exerciseErrors.restSeconds}
          />
        </div>

        <div className={styles.grid}>
          <TextField
            label="Ordem"
            id="executionOrder"
            type="number"
            min={WORKOUT_SHEET_EXERCISE_LIMITS.executionOrder.min}
            max={WORKOUT_SHEET_EXERCISE_LIMITS.executionOrder.max}
            value={exerciseForm.executionOrder}
            onChange={(event) => {
              setExerciseField("executionOrder")(event);
              setExerciseErrors((prev) => ({
                ...prev,
                executionOrder: undefined,
              }));
            }}
            required
            error={exerciseErrors.executionOrder}
          />
          <TextField
            label="Observações do exercício"
            id="notes"
            value={exerciseForm.notes}
            onChange={(event) => {
              setExerciseField("notes")(event);
              setExerciseErrors((prev) => ({ ...prev, notes: undefined }));
            }}
            placeholder="Ajustes de execucao"
            optional
            error={exerciseErrors.notes}
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
            {editingExerciseId
              ? `Salvar em ${activeTrainingSection}`
              : `Adicionar em ${activeTrainingSection}`}
          </Button>
        </div>
      </form>

      <section className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <h3 className={styles.sectionTitle}>Ordem da ficha</h3>
          <p className={styles.sectionDescription}>
            {blockExerciseRows.length} exercicio(s) vinculado(s).
          </p>
        </div>

        <div className={styles.tableWrap}>
          <Table columns={exerciseColumns} minWidth="980px">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Exercício</TableHeaderCell>
                <TableHeaderCell>Bloco</TableHeaderCell>
                <TableHeaderCell>Series</TableHeaderCell>
                <TableHeaderCell>Repeticoes</TableHeaderCell>
                <TableHeaderCell>Descanso</TableHeaderCell>
                <TableHeaderCell>Observações</TableHeaderCell>
                <TableHeaderCell center>Ações</TableHeaderCell>
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
                  message="Nenhum exercício vinculado a esta ficha."
                />
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination
          page={exercisePageData}
          currentPage={exercisePage}
          loading={false}
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

