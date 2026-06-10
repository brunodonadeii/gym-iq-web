import { Autocomplete } from "@/components/Autocomplete/Autocomplete";
import { Button } from "@/components/Button/Button";
import { DetailLoadState } from "@/components/DetailLoadState/DetailLoadState";
import { Skeleton } from "@/components/Skeleton/Skeleton";
import { TextField } from "@/components/TextField/TextField";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useUpdateWorkoutSheet } from "@/mutations/useUpdateWorkoutSheet";
import { getStudentOptionLabel } from "@/pages/Students/types";
import type {
  WorkoutBlock,
  WorkoutSheet,
  WorkoutSheetBlockFormData,
  WorkoutSheetExercise,
  WorkoutSheetExerciseFormData,
  WorkoutSheetSectionsFormData,
} from "@/pages/WorkoutSheets/types";
import {
  validateWorkoutSheetExercise,
  WORKOUT_SHEET_EXERCISE_LIMITS,
} from "@/pages/WorkoutSheets/validation";
import { useGetExercises } from "@/queries/useGetExercises";
import { useGetInstructors } from "@/queries/useGetInstructors";
import { useGetMyInstructor } from "@/queries/useGetMyInstructor";
import { useGetStudentOptions } from "@/queries/useGetStudentOptions";
import { useGetWorkoutSheetById } from "@/queries/useGetWorkoutSheetById";
import { getApiFieldErrors } from "@/utils/apiError";
import { auth } from "@/utils/auth";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import styles from "./WorkoutSheetsEdit.module.css";

const createEmptyExercise = (
  executionOrder: number,
): WorkoutSheetExerciseFormData => ({
  exerciseId: "",
  sets: "",
  repetitions: "",
  loadKg: "",
  restSeconds: "",
  trainingSection: "",
  executionOrder: String(executionOrder),
  notes: "",
});

const createEmptySection = (index: number): WorkoutSheetBlockFormData => ({
  name: `Treino ${String.fromCodePoint(65 + index)}`,
  description: "",
  executionOrder: String(index + 1),
  exercises: [createEmptyExercise(1)],
});

const EMPTY_FORM: WorkoutSheetSectionsFormData = {
  studentId: "",
  instructorId: "",
  name: "",
  goal: "",
  startDate: "",
  endDate: "",
  notes: "",
  blocks: [],
  sections: [],
};

type SheetField = "studentId" | "instructorId" | "name";
type ExerciseField = keyof WorkoutSheetExerciseFormData;

type FormErrors = Partial<Record<SheetField, string>> & {
  sections?: Array<{
    name?: string;
    exercises?: Array<Partial<Record<ExerciseField, string>>>;
  }>;
};

type WorkoutSheetsDetailsContentProps = {
  details?: WorkoutSheet;
  isLoadingDetails: boolean;
  workoutSheetId?: string;
};

const focusField = (id: string) => {
  document.getElementById(id)?.focus();
};

const resolveExerciseName = (exercise: WorkoutSheetExercise) =>
  exercise.exerciseName ?? `Exercício #${exercise.exerciseId}`;

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

const mapWorkoutSheetToSectionsForm = (
  details?: WorkoutSheet,
): WorkoutSheetSectionsFormData => {
  const sections = getWorkoutSheetBlocks(details).map((block, blockIndex) => ({
    name: block.name,
    description: block.description ?? "",
    executionOrder: String(block.executionOrder ?? blockIndex + 1),
    exercises:
      block.exercises?.map((exercise, exerciseIndex) => ({
        exerciseId: String(exercise.exerciseId),
        sets: String(exercise.sets ?? ""),
        repetitions: exercise.repetitions ?? "",
        loadKg: String(exercise.loadKg ?? ""),
        restSeconds: String(exercise.restSeconds ?? ""),
        trainingSection: "",
        executionOrder: String(exercise.executionOrder ?? exerciseIndex + 1),
        notes: exercise.notes ?? "",
      })) ?? [],
  }));

  return {
    studentId: String(details?.studentId ?? details?.student?.studentId ?? ""),
    instructorId: String(
      details?.instructorId ?? details?.instructor?.instructorId ?? "",
    ),
    name: details?.name ?? "",
    goal: details?.goal ?? "",
    startDate: details?.startDate ?? "",
    endDate: details?.endDate ?? "",
    notes: details?.notes ?? "",
    blocks: sections,
    sections: sections.length > 0 ? sections : [createEmptySection(0)],
  };
};

const buildFallbackExerciseSearches = (sections: WorkoutSheetBlockFormData[]) =>
  sections.map((section) => section.exercises.map(() => ""));

const buildInitialExerciseLabels = (details?: WorkoutSheet) =>
  getWorkoutSheetBlocks(details).map((block) =>
    (block.exercises ?? []).map((exercise) => resolveExerciseName(exercise)),
  );

const mapSectionsToPayload = (
  data: WorkoutSheetSectionsFormData,
): WorkoutSheetSectionsFormData["blocks"] =>
  data.sections.map((section, sectionIndex) => ({
    name: section.name.trim(),
    description: section.description.trim(),
    executionOrder: String(sectionIndex + 1),
    exercises: section.exercises.map((exercise, exerciseIndex) => ({
      ...exercise,
      trainingSection: "",
      executionOrder: String(exerciseIndex + 1),
    })),
  }));

const validate = (data: WorkoutSheetSectionsFormData) => {
  const errors: FormErrors = {};
  const sectionErrors: FormErrors["sections"] = [];

  if (!data.studentId) {
    errors.studentId = "Selecione o aluno.";
  }

  if (!data.instructorId) {
    errors.instructorId = "Selecione o instrutor.";
  }

  if (!data.name.trim()) {
    errors.name = "Informe o nome da ficha.";
  }

  data.sections.forEach((section, sectionIndex) => {
    const currentSection: NonNullable<FormErrors["sections"]>[number] = {};
    const exerciseErrors: NonNullable<
      NonNullable<FormErrors["sections"]>[number]["exercises"]
    > = [];

    if (!section.name.trim()) {
      currentSection.name = "Informe o nome do bloco.";
    }

    section.exercises.forEach((exercise, exerciseIndex) => {
      const current: Partial<Record<ExerciseField, string>> = {};

      Object.assign(
        current,
        validateWorkoutSheetExercise(exercise, {
          requireTrainingSection: false,
        }),
      );

      if (Object.keys(current).length > 0) {
        exerciseErrors[exerciseIndex] = current;
      }
    });

    if (exerciseErrors.length > 0) {
      currentSection.exercises = exerciseErrors;
    }

    if (Object.keys(currentSection).length > 0) {
      sectionErrors[sectionIndex] = currentSection;
    }
  });

  if (sectionErrors.length > 0) {
    errors.sections = sectionErrors;
  }

  return errors;
};

const focusFirstError = (errors: FormErrors) => {
  if (errors.studentId) return focusField("studentId");
  if (errors.instructorId) return focusField("instructorId");
  if (errors.name) return focusField("name");

  const sectionIndex = errors.sections?.findIndex(Boolean) ?? -1;
  if (sectionIndex < 0) return;

  const sectionError = errors.sections?.[sectionIndex];
  if (sectionError?.name) {
    focusField(`section-${sectionIndex}-name`);
    return;
  }

  const exerciseIndex = sectionError?.exercises?.findIndex(Boolean) ?? -1;
  if (exerciseIndex < 0) return;

  const exerciseError = sectionError?.exercises?.[exerciseIndex];
  const firstField = Object.keys(exerciseError ?? {})[0];

  if (firstField) {
    focusField(
      `section-${sectionIndex}-exercise-${exerciseIndex}-${firstField}`,
    );
  }
};

const renumberExercises = (
  exercises: WorkoutSheetExerciseFormData[],
): WorkoutSheetExerciseFormData[] =>
  exercises.map((exercise, index) => ({
    ...exercise,
    executionOrder: String(index + 1),
  }));

const renumberSections = (
  sections: WorkoutSheetBlockFormData[],
): WorkoutSheetBlockFormData[] =>
  sections.map((section, index) => ({
    ...section,
    executionOrder: String(index + 1),
    exercises: renumberExercises(section.exercises),
  }));

const WorkoutSheetsEditContent = ({
  details,
  isLoadingDetails,
  workoutSheetId,
}: WorkoutSheetsDetailsContentProps) => {
  const isInstructor = auth.hasAnyRole(["INSTRUCTOR"]);
  const navigate = useNavigate();
  const [data, setData] = useState<WorkoutSheetSectionsFormData>(() =>
    details ? mapWorkoutSheetToSectionsForm(details) : EMPTY_FORM,
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [studentSearch, setStudentSearch] = useState(
    details?.student?.name ?? details?.studentName ?? "",
  );
  const [instructorSearch, setInstructorSearch] = useState(
    details?.instructor?.name ?? details?.instructorName ?? "",
  );
  const [exerciseSearches, setExerciseSearches] = useState<string[][]>(() => {
    const initialLabels = buildInitialExerciseLabels(details);
    if (initialLabels.length > 0) return initialLabels;

    const fallback = buildFallbackExerciseSearches(
      details ? mapWorkoutSheetToSectionsForm(details).sections : [],
    );

    return fallback.length > 0 ? fallback : [[""]];
  });
  const [activeExercisePosition, setActiveExercisePosition] = useState({
    sectionIndex: 0,
    exerciseIndex: 0,
  });
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const debouncedStudentSearch = useDebouncedValue(studentSearch);
  const debouncedInstructorSearch = useDebouncedValue(instructorSearch);
  const hasExpandedSection = expandedSections.length > 0;
  const debouncedExerciseSearch = useDebouncedValue(
    hasExpandedSection
      ? (exerciseSearches[activeExercisePosition.sectionIndex]?.[
          activeExercisePosition.exerciseIndex
        ] ?? "")
      : "",
  );
  const {
    data: studentOptions,
    isFetching: isFetchingStudents,
    isFetchingNextPage: isFetchingMoreStudents,
    hasNextPage: hasMoreStudents,
    fetchNextPage: fetchMoreStudents,
  } = useGetStudentOptions(debouncedStudentSearch);
  const { data: me } = useGetMyInstructor(isInstructor);
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
  const { data: exercises, isFetching: isFetchingExercises } = useGetExercises(
    "active",
    debouncedExerciseSearch,
    {
      size: 20,
      sort: "name,asc",
    },
    hasExpandedSection,
  );
  const { mutate: updateSheet, isPending: isUpdatingSheet } =
    useUpdateWorkoutSheet();

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

  const exerciseOptions =
    exercises?.content.map((exercise) => ({
      label: exercise.name,
      value: String(exercise.exerciseId),
      description: exercise.muscleGroup,
    })) ?? [];

  const effectiveInstructorId = isInstructor
    ? String(me?.instructorId ?? "")
    : data.instructorId;
  const effectiveInstructorName = isInstructor
    ? (me?.name ?? "")
    : instructorSearch;
  const effectiveData: WorkoutSheetSectionsFormData = {
    ...data,
    instructorId: effectiveInstructorId,
  };

  const isSectionExpanded = (sectionIndex: number) =>
    expandedSections.includes(sectionIndex);

  const clearError = (
    field: SheetField | ExerciseField | "name",
    sectionIndex?: number,
    exerciseIndex?: number,
  ) => {
    setErrors((prev) => {
      if (sectionIndex === undefined) {
        return { ...prev, [field]: undefined };
      }

      const nextSectionErrors = [...(prev.sections ?? [])];
      const currentSection = nextSectionErrors[sectionIndex] ?? {};

      if (exerciseIndex === undefined) {
        nextSectionErrors[sectionIndex] = {
          ...currentSection,
          name: undefined,
        };

        return { ...prev, sections: nextSectionErrors };
      }

      const nextExerciseErrors = [...(currentSection.exercises ?? [])];
      nextExerciseErrors[exerciseIndex] = {
        ...nextExerciseErrors[exerciseIndex],
        [field]: undefined,
      };

      nextSectionErrors[sectionIndex] = {
        ...currentSection,
        exercises: nextExerciseErrors,
      };

      return { ...prev, sections: nextSectionErrors };
    });
  };

  const toggleSection = (sectionIndex: number) => {
    const expanded = isSectionExpanded(sectionIndex);

    setExpandedSections((prev) =>
      expanded
        ? prev.filter((currentIndex) => currentIndex !== sectionIndex)
        : [...prev, sectionIndex],
    );

    if (!expanded) {
      setActiveExercisePosition({
        sectionIndex,
        exerciseIndex: 0,
      });
    }
  };

  const updateSectionField = (
    sectionIndex: number,
    field: "name" | "description",
    value: string,
  ) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, currentSectionIndex) =>
        currentSectionIndex === sectionIndex
          ? { ...section, [field]: value }
          : section,
      ),
    }));

    if (field === "name") {
      clearError("name", sectionIndex);
    }
  };

  const updateExerciseField = (
    sectionIndex: number,
    exerciseIndex: number,
    field: keyof WorkoutSheetExerciseFormData,
    value: string,
  ) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, currentSectionIndex) =>
        currentSectionIndex === sectionIndex
          ? {
              ...section,
              exercises: section.exercises.map(
                (exercise, currentExerciseIndex) =>
                  currentExerciseIndex === exerciseIndex
                    ? { ...exercise, [field]: value }
                    : exercise,
              ),
            }
          : section,
      ),
    }));
    clearError(field, sectionIndex, exerciseIndex);
  };

  const addSection = () => {
    setData((prev) => ({
      ...prev,
      sections: [...prev.sections, createEmptySection(prev.sections.length)],
    }));
    setExerciseSearches((prev) => [...prev, [""]]);
    setExpandedSections((prev) => [...prev, data.sections.length]);
    setActiveExercisePosition({
      sectionIndex: data.sections.length,
      exerciseIndex: 0,
    });
  };

  const removeSection = (sectionIndex: number) => {
    setData((prev) => ({
      ...prev,
      sections: renumberSections(
        prev.sections.filter(
          (_, currentSectionIndex) => currentSectionIndex !== sectionIndex,
        ),
      ),
    }));
    setExerciseSearches((prev) =>
      prev.filter(
        (_, currentSectionIndex) => currentSectionIndex !== sectionIndex,
      ),
    );
    setExpandedSections((prev) =>
      prev
        .filter((currentSectionIndex) => currentSectionIndex !== sectionIndex)
        .map((currentSectionIndex) =>
          currentSectionIndex > sectionIndex
            ? currentSectionIndex - 1
            : currentSectionIndex,
        ),
    );
    setErrors((prev) => ({
      ...prev,
      sections: prev.sections?.filter(
        (_, currentSectionIndex) => currentSectionIndex !== sectionIndex,
      ),
    }));
    setActiveExercisePosition({ sectionIndex: 0, exerciseIndex: 0 });
  };

  const addExercise = (sectionIndex: number) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, currentSectionIndex) =>
        currentSectionIndex === sectionIndex
          ? {
              ...section,
              exercises: [
                ...section.exercises,
                createEmptyExercise(section.exercises.length + 1),
              ],
            }
          : section,
      ),
    }));
    setExerciseSearches((prev) =>
      prev.map((sectionSearches, currentSectionIndex) =>
        currentSectionIndex === sectionIndex
          ? [...sectionSearches, ""]
          : sectionSearches,
      ),
    );
    setActiveExercisePosition({
      sectionIndex,
      exerciseIndex: data.sections[sectionIndex]?.exercises.length ?? 0,
    });
  };

  const removeExercise = (sectionIndex: number, exerciseIndex: number) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, currentSectionIndex) =>
        currentSectionIndex === sectionIndex
          ? {
              ...section,
              exercises: renumberExercises(
                section.exercises.filter(
                  (_, currentExerciseIndex) =>
                    currentExerciseIndex !== exerciseIndex,
                ),
              ),
            }
          : section,
      ),
    }));
    setExerciseSearches((prev) =>
      prev.map((sectionSearches, currentSectionIndex) =>
        currentSectionIndex === sectionIndex
          ? sectionSearches.filter(
              (_, currentExerciseIndex) =>
                currentExerciseIndex !== exerciseIndex,
            )
          : sectionSearches,
      ),
    );
    setErrors((prev) => ({
      ...prev,
      sections: prev.sections?.map((section, currentSectionIndex) =>
        currentSectionIndex === sectionIndex
          ? {
              ...section,
              exercises: section.exercises?.filter(
                (_, currentExerciseIndex) =>
                  currentExerciseIndex !== exerciseIndex,
              ),
            }
          : section,
      ),
    }));
    setActiveExercisePosition({ sectionIndex, exerciseIndex: 0 });
  };

  const moveExercise = (
    sectionIndex: number,
    exerciseIndex: number,
    direction: "up" | "down",
  ) => {
    const targetIndex =
      direction === "up" ? exerciseIndex - 1 : exerciseIndex + 1;
    const section = data.sections[sectionIndex];

    if (
      !section ||
      targetIndex < 0 ||
      targetIndex >= section.exercises.length
    ) {
      return;
    }

    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((currentSection, currentSectionIndex) => {
        if (currentSectionIndex !== sectionIndex) return currentSection;

        const nextExercises = [...currentSection.exercises];
        const [movedExercise] = nextExercises.splice(exerciseIndex, 1);
        nextExercises.splice(targetIndex, 0, movedExercise);

        return {
          ...currentSection,
          exercises: renumberExercises(nextExercises),
        };
      }),
    }));

    setExerciseSearches((prev) =>
      prev.map((sectionSearches, currentSectionIndex) => {
        if (currentSectionIndex !== sectionIndex) return sectionSearches;

        const nextSearches = [...sectionSearches];
        const [movedSearch] = nextSearches.splice(exerciseIndex, 1);
        nextSearches.splice(targetIndex, 0, movedSearch);
        return nextSearches;
      }),
    );

    setActiveExercisePosition({
      sectionIndex,
      exerciseIndex: targetIndex,
    });
  };

  const handleUpdateSheet = () => {
    const nextErrors = validate(effectiveData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      focusFirstError(nextErrors);
      return;
    }

    updateSheet(
      {
        id: String(workoutSheetId),
        data: {
          studentId: effectiveData.studentId,
          instructorId: effectiveInstructorId,
          name: effectiveData.name,
          goal: effectiveData.goal,
          startDate: effectiveData.startDate,
          endDate: effectiveData.endDate,
          notes: effectiveData.notes,
          blocks: mapSectionsToPayload(effectiveData),
        },
      },
      {
        onSuccess: () => toast.success("Ficha atualizada com sucesso!"),
        onError: (e) => {
          const fieldErrors = getApiFieldErrors(e, [
            "studentId",
            "instructorId",
            "name",
          ] as const);

          if (fieldErrors) {
            setErrors(fieldErrors);
            focusFirstError(fieldErrors);
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
                Atualize aluno, instrutor, nome, objetivo e período da ficha.
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
            <>
              <div className={styles.row}>
                <Autocomplete
                  label="Aluno"
                  id="studentId"
                  search={studentSearch}
                  onSearchChange={(value) => {
                    setStudentSearch(value);
                    setData((prev) => ({ ...prev, studentId: "" }));
                    clearError("studentId");
                  }}
                  onSelect={(option) => {
                    setStudentSearch(option.label);
                    setData((prev) => ({ ...prev, studentId: option.value }));
                    clearError("studentId");
                  }}
                  onClear={() => {
                    setStudentSearch("");
                    setData((prev) => ({ ...prev, studentId: "" }));
                  }}
                  options={autocompleteStudentOptions}
                  loading={
                    isFetchingStudents &&
                    autocompleteStudentOptions.length === 0
                  }
                  loadingMore={isFetchingMoreStudents}
                  hasMoreOptions={Boolean(hasMoreStudents)}
                  onLoadMore={() => void fetchMoreStudents()}
                  placeholder="Digite o nome ou o CPF/e-mail completos"
                  error={errors.studentId}
                  required
                />
                {isInstructor ? (
                  <TextField
                    label="Instrutor"
                    id="instructorId"
                    value={effectiveInstructorName}
                    onChange={() => undefined}
                    helperText={me?.email ?? undefined}
                    error={errors.instructorId}
                    required
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
                      setData((prev) => ({ ...prev, instructorId: "" }));
                      clearError("instructorId");
                    }}
                    onSelect={(option) => {
                      setInstructorSearch(option.label);
                      setData((prev) => ({
                        ...prev,
                        instructorId: option.value,
                      }));
                      clearError("instructorId");
                    }}
                    onClear={() => {
                      setInstructorSearch("");
                      setData((prev) => ({ ...prev, instructorId: "" }));
                    }}
                    options={instructorOptions}
                    loading={isFetchingInstructors}
                    placeholder="Digite nome, CREF ou e-mail completo"
                    error={errors.instructorId}
                    required
                  />
                )}
              </div>

              <div className={styles.row}>
                <TextField
                  label="Nome da ficha"
                  id="name"
                  value={data.name}
                  onChange={(event) => {
                    setData((prev) => ({ ...prev, name: event.target.value }));
                    clearError("name");
                  }}
                  error={errors.name}
                  required
                />
                <TextField
                  label="Objetivo"
                  id="goal"
                  value={data.goal}
                  onChange={(event) =>
                    setData((prev) => ({ ...prev, goal: event.target.value }))
                  }
                  optional
                />
              </div>

              <div className={styles.row}>
                <TextField
                  label="Data de início"
                  id="startDate"
                  type="date"
                  value={data.startDate}
                  onChange={(event) =>
                    setData((prev) => ({
                      ...prev,
                      startDate: event.target.value,
                    }))
                  }
                  optional
                />
                <TextField
                  label="Data de fim"
                  id="endDate"
                  type="date"
                  value={data.endDate}
                  onChange={(event) =>
                    setData((prev) => ({
                      ...prev,
                      endDate: event.target.value,
                    }))
                  }
                  optional
                />
              </div>

              <div className={styles.row}>
                <TextField
                  label="Observações da ficha"
                  id="notes"
                  value={data.notes}
                  onChange={(event) =>
                    setData((prev) => ({ ...prev, notes: event.target.value }))
                  }
                  optional
                />
              </div>
            </>
          )}
        </section>

        <section className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <h3 className={styles.sectionTitle}>Blocos e exercícios</h3>
              <p className={styles.sectionDescription}>
                Expanda apenas o bloco que quiser editar. Os exercícios só são
                montados na interface depois da abertura do accordion.
              </p>
            </div>
          </div>

          <div className={styles.exerciseList}>
            {data.sections.map((section, sectionIndex) => {
              const sectionErrors = errors.sections?.[sectionIndex] ?? {};
              const expanded = isSectionExpanded(sectionIndex);

              return (
                <div className={styles.sectionCard} key={sectionIndex}>
                  <button
                    type="button"
                    className={styles.sectionToggle}
                    onClick={() => toggleSection(sectionIndex)}
                    aria-expanded={expanded}
                  >
                    <div className={styles.sectionToggleContent}>
                      <span className={styles.sectionBadge}>
                        Bloco {sectionIndex + 1}
                      </span>
                      <strong className={styles.sectionToggleTitle}>
                        {section.name || `Treino ${sectionIndex + 1}`}
                      </strong>
                      <p className={styles.sectionMeta}>
                        {expanded
                          ? "Bloco aberto para edição."
                          : "Clique para expandir e editar este bloco."}
                      </p>
                    </div>
                    <span
                      className={styles.sectionToggleIcon}
                      aria-hidden="true"
                    >
                      {expanded ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </span>
                  </button>

                  {expanded && (
                    <>
                      <div className={styles.sectionTopBar}>
                        <div className={styles.sectionExpandedMeta}>
                          <p className={styles.sectionMeta}>
                            {section.exercises.length} exercício(s) neste bloco.
                          </p>
                        </div>
                        {data.sections.length > 1 && (
                          <Button
                            variant="ghost"
                            leftIcon={<Trash2 size={16} />}
                            onClick={() => removeSection(sectionIndex)}
                            disabled={isUpdatingSheet}
                          >
                            Remover bloco
                          </Button>
                        )}
                      </div>

                      <div className={styles.row}>
                        <TextField
                          label="Bloco do treino"
                          id={`section-${sectionIndex}-name`}
                          value={section.name}
                          onChange={(event) =>
                            updateSectionField(
                              sectionIndex,
                              "name",
                              event.target.value,
                            )
                          }
                          placeholder="Treino A"
                          error={sectionErrors.name}
                          required
                        />
                        <TextField
                          label="Descrição do bloco"
                          id={`section-${sectionIndex}-description`}
                          value={section.description}
                          onChange={(event) =>
                            updateSectionField(
                              sectionIndex,
                              "description",
                              event.target.value,
                            )
                          }
                          placeholder="Peito, ombro e tríceps"
                          optional
                        />
                      </div>

                      <div className={styles.sectionExerciseList}>
                        {section.exercises.length === 0 ? (
                          <div className={styles.emptyExerciseState}>
                            Nenhum exercício neste bloco ainda.
                          </div>
                        ) : (
                          section.exercises.map((exercise, exerciseIndex) => {
                            const currentErrors =
                              sectionErrors.exercises?.[exerciseIndex] ?? {};
                            const isActiveExercise =
                              activeExercisePosition.sectionIndex ===
                                sectionIndex &&
                              activeExercisePosition.exerciseIndex ===
                                exerciseIndex;

                            return (
                              <div
                                className={styles.exerciseCard}
                                key={exerciseIndex}
                              >
                                <div className={styles.exerciseCardHeader}>
                                  <div>
                                    <strong className={styles.exerciseTitle}>
                                      Exercício {exerciseIndex + 1}
                                    </strong>
                                    <p className={styles.exerciseMeta}>
                                      Reorganize pela posição da lista sem
                                      editar a ordem manualmente.
                                    </p>
                                  </div>

                                  <div className={styles.exerciseActions}>
                                    <Button
                                      variant="ghost"
                                      leftIcon={<ArrowUp size={16} />}
                                      onClick={() =>
                                        moveExercise(
                                          sectionIndex,
                                          exerciseIndex,
                                          "up",
                                        )
                                      }
                                      disabled={
                                        exerciseIndex === 0 || isUpdatingSheet
                                      }
                                    >
                                      Subir
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      leftIcon={<ArrowDown size={16} />}
                                      onClick={() =>
                                        moveExercise(
                                          sectionIndex,
                                          exerciseIndex,
                                          "down",
                                        )
                                      }
                                      disabled={
                                        exerciseIndex ===
                                          section.exercises.length - 1 ||
                                        isUpdatingSheet
                                      }
                                    >
                                      Descer
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      leftIcon={<Trash2 size={16} />}
                                      onClick={() =>
                                        removeExercise(
                                          sectionIndex,
                                          exerciseIndex,
                                        )
                                      }
                                      disabled={isUpdatingSheet}
                                    >
                                      Remover
                                    </Button>
                                  </div>
                                </div>

                                <div className={styles.row}>
                                  <Autocomplete
                                    label="Exercício"
                                    id={`section-${sectionIndex}-exercise-${exerciseIndex}-exerciseId`}
                                    search={
                                      exerciseSearches[sectionIndex]?.[
                                        exerciseIndex
                                      ] ?? ""
                                    }
                                    onSearchChange={(value) => {
                                      setActiveExercisePosition({
                                        sectionIndex,
                                        exerciseIndex,
                                      });
                                      setExerciseSearches((prev) =>
                                        prev.map(
                                          (
                                            sectionSearches,
                                            currentSectionIndex,
                                          ) =>
                                            currentSectionIndex === sectionIndex
                                              ? sectionSearches.map(
                                                  (
                                                    search,
                                                    currentExerciseIndex,
                                                  ) =>
                                                    currentExerciseIndex ===
                                                    exerciseIndex
                                                      ? value
                                                      : search,
                                                )
                                              : sectionSearches,
                                        ),
                                      );
                                      updateExerciseField(
                                        sectionIndex,
                                        exerciseIndex,
                                        "exerciseId",
                                        "",
                                      );
                                    }}
                                    onSelect={(option) => {
                                      setExerciseSearches((prev) =>
                                        prev.map(
                                          (
                                            sectionSearches,
                                            currentSectionIndex,
                                          ) =>
                                            currentSectionIndex === sectionIndex
                                              ? sectionSearches.map(
                                                  (
                                                    search,
                                                    currentExerciseIndex,
                                                  ) =>
                                                    currentExerciseIndex ===
                                                    exerciseIndex
                                                      ? option.label
                                                      : search,
                                                )
                                              : sectionSearches,
                                        ),
                                      );
                                      updateExerciseField(
                                        sectionIndex,
                                        exerciseIndex,
                                        "exerciseId",
                                        option.value,
                                      );
                                    }}
                                    onClear={() => {
                                      setExerciseSearches((prev) =>
                                        prev.map(
                                          (
                                            sectionSearches,
                                            currentSectionIndex,
                                          ) =>
                                            currentSectionIndex === sectionIndex
                                              ? sectionSearches.map(
                                                  (
                                                    search,
                                                    currentExerciseIndex,
                                                  ) =>
                                                    currentExerciseIndex ===
                                                    exerciseIndex
                                                      ? ""
                                                      : search,
                                                )
                                              : sectionSearches,
                                        ),
                                      );
                                      updateExerciseField(
                                        sectionIndex,
                                        exerciseIndex,
                                        "exerciseId",
                                        "",
                                      );
                                    }}
                                    options={
                                      isActiveExercise ? exerciseOptions : []
                                    }
                                    loading={
                                      isActiveExercise && isFetchingExercises
                                    }
                                    placeholder="Digite o nome do exercício"
                                    error={currentErrors.exerciseId}
                                    required
                                  />
                                  <TextField
                                    label="Séries"
                                    id={`section-${sectionIndex}-exercise-${exerciseIndex}-sets`}
                                    type="number"
                                    min={WORKOUT_SHEET_EXERCISE_LIMITS.sets.min}
                                    max={WORKOUT_SHEET_EXERCISE_LIMITS.sets.max}
                                    value={exercise.sets}
                                    onChange={(event) =>
                                      updateExerciseField(
                                        sectionIndex,
                                        exerciseIndex,
                                        "sets",
                                        event.target.value,
                                      )
                                    }
                                    error={currentErrors.sets}
                                    required
                                  />
                                </div>

                                <div className={styles.row}>
                                  <TextField
                                    label="Repetições"
                                    id={`section-${sectionIndex}-exercise-${exerciseIndex}-repetitions`}
                                    value={exercise.repetitions}
                                    onChange={(event) =>
                                      updateExerciseField(
                                        sectionIndex,
                                        exerciseIndex,
                                        "repetitions",
                                        event.target.value,
                                      )
                                    }
                                    placeholder="10-12"
                                    error={currentErrors.repetitions}
                                    required
                                  />
                                  <TextField
                                    label="Descanso em segundos"
                                    id={`section-${sectionIndex}-exercise-${exerciseIndex}-restSeconds`}
                                    type="number"
                                    min={
                                      WORKOUT_SHEET_EXERCISE_LIMITS.restSeconds
                                        .min
                                    }
                                    max={
                                      WORKOUT_SHEET_EXERCISE_LIMITS.restSeconds
                                        .max
                                    }
                                    value={exercise.restSeconds}
                                    onChange={(event) =>
                                      updateExerciseField(
                                        sectionIndex,
                                        exerciseIndex,
                                        "restSeconds",
                                        event.target.value,
                                      )
                                    }
                                    optional
                                    error={currentErrors.restSeconds}
                                  />
                                </div>

                                <div className={styles.row}>
                                  <TextField
                                    label="Posição na lista"
                                    id={`section-${sectionIndex}-exercise-${exerciseIndex}-executionOrder`}
                                    type="number"
                                    min={
                                      WORKOUT_SHEET_EXERCISE_LIMITS
                                        .executionOrder.min
                                    }
                                    max={
                                      WORKOUT_SHEET_EXERCISE_LIMITS
                                        .executionOrder.max
                                    }
                                    value={exercise.executionOrder}
                                    onChange={() => undefined}
                                    helperText="A ordem é definida automaticamente pela posição do exercício."
                                    error={currentErrors.executionOrder}
                                    required
                                    readOnly
                                    disabled
                                  />
                                  <TextField
                                    label="Observações do exercício"
                                    id={`section-${sectionIndex}-exercise-${exerciseIndex}-notes`}
                                    value={exercise.notes}
                                    onChange={(event) =>
                                      updateExerciseField(
                                        sectionIndex,
                                        exerciseIndex,
                                        "notes",
                                        event.target.value,
                                      )
                                    }
                                    placeholder="Controlar descida"
                                    optional
                                  />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className={styles.addExerciseRow}>
                        <Button
                          variant="secondary"
                          leftIcon={<PlusCircle size={18} />}
                          onClick={() => addExercise(sectionIndex)}
                          disabled={isUpdatingSheet}
                        >
                          Adicionar exercício em {section.name || "bloco"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.addExerciseRow}>
            <Button
              variant="secondary"
              leftIcon={<PlusCircle size={18} />}
              onClick={addSection}
              disabled={isUpdatingSheet}
            >
              Adicionar bloco
            </Button>
          </div>
        </section>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              navigate({
                to: "/workout-sheets/$workoutSheetId",
                params: { workoutSheetId: String(workoutSheetId) },
              })
            }
            disabled={isUpdatingSheet}
          >
            Voltar
          </Button>
          <Button
            type="submit"
            loading={isUpdatingSheet}
            disabled={
              !data.studentId ||
              !effectiveInstructorId ||
              !data.name.trim() ||
              data.sections.length === 0
            }
          >
            Salvar ficha
          </Button>
        </div>
      </form>
    </div>
  );
};

export const WorkoutSheetsEdit = () => {
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
        onBack={() =>
          navigate({
            to: "/workout-sheets/$workoutSheetId",
            params: { workoutSheetId: String(workoutSheetId) },
          })
        }
      />
    );
  }

  if (isError || (!isLoadingDetails && !details)) {
    return (
      <DetailLoadState
        entity={{ name: "Ficha de treino", article: "esta", pronoun: "ela" }}
        error={error}
        onBack={() =>
          navigate({
            to: "/workout-sheets/$workoutSheetId",
            params: { workoutSheetId: String(workoutSheetId) },
          })
        }
      />
    );
  }

  return (
    <WorkoutSheetsEditContent
      key={`${workoutSheetId ?? "new"}-${details?.updatedAt ?? isLoadingDetails}`}
      details={details}
      isLoadingDetails={isLoadingDetails}
      workoutSheetId={workoutSheetId}
    />
  );
};
