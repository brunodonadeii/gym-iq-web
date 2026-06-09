import { Autocomplete } from "@/components/Autocomplete/Autocomplete";
import { Button } from "@/components/Button/Button";
import { Form } from "@/components/Form/Form";
import { TextField } from "@/components/TextField/TextField";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useFormInputs } from "@/hooks/useFormInputs";
import { useCreateWorkoutSheet } from "@/mutations/useCreateWorkoutSheet";
import type {
  WorkoutSheetExerciseFormData,
  WorkoutSheetFormData,
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
import { auth } from "@/utils/auth";
import { getApiFieldErrors } from "@/utils/apiError";
import { useNavigate } from "@tanstack/react-router";
import { PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import styles from "./WorkoutSheetsCreate.module.css";

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

const createEmptySection = (index: number) => ({
  name: `Treino ${String.fromCharCode(65 + index)}`,
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
  sections: [createEmptySection(0)],
};

type SheetField = "studentId" | "instructorId" | "name";
type ExerciseField = keyof WorkoutSheetExerciseFormData;

type FormErrors = Partial<Record<SheetField, string>> & {
  sections?: Array<{
    name?: string;
    exercises?: Array<Partial<Record<ExerciseField, string>>>;
  }>;
};

const focusField = (id: string) => {
  document.getElementById(id)?.focus();
};

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

const mapSectionsToPayload = (
  data: WorkoutSheetSectionsFormData,
): WorkoutSheetFormData => {
  const { sections, ...sheetData } = data;

  return {
    ...sheetData,
    blocks: sections.map((section, sectionIndex) => ({
      name: section.name.trim(),
      description: section.description.trim(),
      executionOrder: section.executionOrder || String(sectionIndex + 1),
      exercises: section.exercises.map((exercise, exerciseIndex) => ({
        ...exercise,
        trainingSection: "",
        executionOrder: exercise.executionOrder || String(exerciseIndex + 1),
      })),
    })),
  };
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
    focusField(`section-${sectionIndex}-exercise-${exerciseIndex}-${firstField}`);
  }
};

export const WorkoutSheetsCreate = () => {
  const isInstructor = auth.hasAnyRole(["INSTRUCTOR"]);
  const [data, setData] = useState<WorkoutSheetSectionsFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [studentSearch, setStudentSearch] = useState("");
  const [instructorSearch, setInstructorSearch] = useState("");
  const [exerciseSearches, setExerciseSearches] = useState([[""]]);
  const [activeExercisePosition, setActiveExercisePosition] = useState({
    sectionIndex: 0,
    exerciseIndex: 0,
  });
  const debouncedStudentSearch = useDebouncedValue(studentSearch);
  const debouncedInstructorSearch = useDebouncedValue(instructorSearch);
  const debouncedExerciseSearch = useDebouncedValue(
    exerciseSearches[activeExercisePosition.sectionIndex]?.[
      activeExercisePosition.exerciseIndex
    ] ?? "",
  );
  const { set } = useFormInputs(setData);
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateWorkoutSheet();
  const { data: studentOptions, isFetching: isFetchingStudents } =
    useGetStudentOptions(debouncedStudentSearch);
  const { data: me, isLoading: isLoadingMyInstructor } =
    useGetMyInstructor(isInstructor);
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
    : data.instructorId;
  const effectiveInstructorName = isInstructor ? (me?.name ?? "") : instructorSearch;
  const effectiveData: WorkoutSheetSectionsFormData = {
    ...data,
    instructorId: effectiveInstructorId,
  };

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

  const updateExercise = (
    sectionIndex: number,
    index: number,
    field: keyof WorkoutSheetExerciseFormData,
    value: string,
  ) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, currentSectionIndex) =>
        currentSectionIndex === sectionIndex
          ? {
              ...section,
              exercises: section.exercises.map((exercise, exerciseIndex) =>
                exerciseIndex === index
                  ? { ...exercise, [field]: value }
                  : exercise,
              ),
            }
          : section,
      ),
    }));
    clearError(field, sectionIndex, index);
  };

  const updateSectionName = (sectionIndex: number, value: string) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, currentSectionIndex) =>
        currentSectionIndex === sectionIndex
          ? { ...section, name: value }
          : section,
      ),
    }));
    clearError("name", sectionIndex);
  };

  const addSection = () => {
    setData((prev) => ({
      ...prev,
      sections: [...prev.sections, createEmptySection(prev.sections.length)],
    }));
    setExerciseSearches((prev) => [...prev, [""]]);
  };

  const removeSection = (sectionIndex: number) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.filter(
        (_, currentSectionIndex) => currentSectionIndex !== sectionIndex,
      ),
    }));
    setExerciseSearches((prev) =>
      prev.filter((_, currentSectionIndex) => currentSectionIndex !== sectionIndex),
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
  };

  const removeExercise = (sectionIndex: number, index: number) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, currentSectionIndex) =>
        currentSectionIndex === sectionIndex
          ? {
              ...section,
              exercises: section.exercises
                .filter((_, exerciseIndex) => exerciseIndex !== index)
                .map((exercise, exerciseIndex) => ({
                  ...exercise,
                  executionOrder: String(exerciseIndex + 1),
                })),
            }
          : section,
      ),
    }));
    setExerciseSearches((prev) =>
      prev.map((sectionSearches, currentSectionIndex) =>
        currentSectionIndex === sectionIndex
          ? sectionSearches.filter(
              (_, exerciseIndex) => exerciseIndex !== index,
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
                (_, exerciseIndex) => exerciseIndex !== index,
              ),
            }
          : section,
      ),
    }));
    setActiveExercisePosition({ sectionIndex: 0, exerciseIndex: 0 });
  };

  const handleSubmit = () => {
    const nextErrors = validate(effectiveData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      focusFirstError(nextErrors);
      return;
    }

    mutate(
      { data: mapSectionsToPayload(effectiveData) },
      {
        onSuccess: () => {
          toast.success("Ficha criada com sucesso!");
          navigate({ to: "/workout-sheets" });
        },
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
    <Form
      title="Dados da ficha"
      description="Vincule aluno, instrutor, período de vigência e exercícios da ficha."
      loading={false}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button
            variant="secondary"
            onClick={() => navigate({ to: "/workout-sheets" })}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isPending}
            disabled={isInstructor && !effectiveInstructorId}
          >
            Salvar
          </Button>
        </>
      }
    >
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
          loading={isFetchingStudents}
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
            placeholder={isLoadingMyInstructor ? "Carregando..." : ""}
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
              setData((prev) => ({ ...prev, instructorId: option.value }));
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
            set("name")(event);
            clearError("name");
          }}
          placeholder="Treino A"
          error={errors.name}
          required
        />
        <TextField
          label="Objetivo"
          id="goal"
          value={data.goal}
          onChange={set("goal")}
          placeholder="Hipertrofia"
          optional
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="Data de início"
          id="startDate"
          type="date"
          value={data.startDate}
          onChange={set("startDate")}
          optional
        />
        <TextField
          label="Data de fim"
          id="endDate"
          type="date"
          value={data.endDate}
          onChange={set("endDate")}
          optional
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="Observações da ficha"
          id="notes"
          value={data.notes}
          onChange={set("notes")}
          placeholder="Foco em membros superiores"
          optional
        />
      </div>

      <section className={styles.exercisesSection}>
        <div className={styles.exercisesHeader}>
          <div>
            <h3 className={styles.exercisesTitle}>Exercícios</h3>
            <p className={styles.exercisesDescription}>
              Monte a ficha com todos os exercícios antes de salvar.
            </p>
          </div>
        </div>

        <div className={styles.exerciseList}>
          {data.sections.map((section, sectionIndex) => {
            const sectionErrors = errors.sections?.[sectionIndex] ?? {};

            return (
              <div className={styles.sectionCard} key={sectionIndex}>
                <div className={styles.sectionCardHeader}>
                  <TextField
                    label="Bloco do treino"
                    id={`section-${sectionIndex}-name`}
                    value={section.name}
                    onChange={(event) =>
                      updateSectionName(sectionIndex, event.target.value)
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
                      setData((prev) => ({
                        ...prev,
                        sections: prev.sections.map((current, currentIndex) =>
                          currentIndex === sectionIndex
                            ? { ...current, description: event.target.value }
                            : current,
                        ),
                      }))
                    }
                    placeholder="Peito, ombro e tríceps"
                    optional
                  />
                  {data.sections.length > 1 && (
                    <Button
                      variant="ghost"
                      leftIcon={<Trash2 size={16} />}
                      onClick={() => removeSection(sectionIndex)}
                      disabled={isPending}
                    >
                      Remover bloco
                    </Button>
                  )}
                </div>

                <div className={styles.sectionExerciseList}>
                  {section.exercises.map((exercise, index) => {
                    const currentErrors =
                      sectionErrors.exercises?.[index] ?? {};
                    const isActiveExercise =
                      activeExercisePosition.sectionIndex === sectionIndex &&
                      activeExercisePosition.exerciseIndex === index;

                    return (
                      <div className={styles.exerciseCard} key={index}>
                        <div className={styles.exerciseCardHeader}>
                          <strong>Exercício {index + 1}</strong>
                          {section.exercises.length > 1 && (
                            <Button
                              variant="ghost"
                              leftIcon={<Trash2 size={16} />}
                              onClick={() => removeExercise(sectionIndex, index)}
                              disabled={isPending}
                            >
                              Remover
                            </Button>
                          )}
                        </div>

                        <div className={styles.row}>
                          <Autocomplete
                            label="Exercício"
                            id={`section-${sectionIndex}-exercise-${index}-exerciseId`}
                            search={
                              exerciseSearches[sectionIndex]?.[index] ?? ""
                            }
                            onSearchChange={(value) => {
                              setActiveExercisePosition({
                                sectionIndex,
                                exerciseIndex: index,
                              });
                              setExerciseSearches((prev) =>
                                prev.map((sectionSearches, currentSectionIndex) =>
                                  currentSectionIndex === sectionIndex
                                    ? sectionSearches.map((search, searchIndex) =>
                                        searchIndex === index ? value : search,
                                      )
                                    : sectionSearches,
                                ),
                              );
                              updateExercise(
                                sectionIndex,
                                index,
                                "exerciseId",
                                "",
                              );
                            }}
                            onSelect={(option) => {
                              setExerciseSearches((prev) =>
                                prev.map((sectionSearches, currentSectionIndex) =>
                                  currentSectionIndex === sectionIndex
                                    ? sectionSearches.map((search, searchIndex) =>
                                        searchIndex === index
                                          ? option.label
                                          : search,
                                      )
                                    : sectionSearches,
                                ),
                              );
                              updateExercise(
                                sectionIndex,
                                index,
                                "exerciseId",
                                option.value,
                              );
                            }}
                            onClear={() => {
                              setExerciseSearches((prev) =>
                                prev.map((sectionSearches, currentSectionIndex) =>
                                  currentSectionIndex === sectionIndex
                                    ? sectionSearches.map((search, searchIndex) =>
                                        searchIndex === index ? "" : search,
                                      )
                                    : sectionSearches,
                                ),
                              );
                              updateExercise(
                                sectionIndex,
                                index,
                                "exerciseId",
                                "",
                              );
                            }}
                            options={isActiveExercise ? exerciseOptions : []}
                            loading={isActiveExercise && isFetchingExercises}
                            placeholder="Digite o nome do exercício"
                            error={currentErrors.exerciseId}
                            required
                          />
                          <TextField
                            label="Séries"
                            id={`section-${sectionIndex}-exercise-${index}-sets`}
                            type="number"
                            min={WORKOUT_SHEET_EXERCISE_LIMITS.sets.min}
                            max={WORKOUT_SHEET_EXERCISE_LIMITS.sets.max}
                            value={exercise.sets}
                            onChange={(event) =>
                              updateExercise(
                                sectionIndex,
                                index,
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
                            id={`section-${sectionIndex}-exercise-${index}-repetitions`}
                            value={exercise.repetitions}
                            onChange={(event) =>
                              updateExercise(
                                sectionIndex,
                                index,
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
                            id={`section-${sectionIndex}-exercise-${index}-restSeconds`}
                            type="number"
                            min={WORKOUT_SHEET_EXERCISE_LIMITS.restSeconds.min}
                            max={WORKOUT_SHEET_EXERCISE_LIMITS.restSeconds.max}
                            value={exercise.restSeconds}
                            optional
                            onChange={(event) =>
                              updateExercise(
                                sectionIndex,
                                index,
                                "restSeconds",
                                event.target.value,
                              )
                            }
                            error={currentErrors.restSeconds}
                          />
                        </div>

                        <div className={styles.row}>
                          <TextField
                            label="Ordem"
                            id={`section-${sectionIndex}-exercise-${index}-executionOrder`}
                            type="number"
                            min={WORKOUT_SHEET_EXERCISE_LIMITS.executionOrder.min}
                            max={WORKOUT_SHEET_EXERCISE_LIMITS.executionOrder.max}
                            value={exercise.executionOrder}
                            onChange={(event) =>
                              updateExercise(
                                sectionIndex,
                                index,
                                "executionOrder",
                                event.target.value,
                              )
                            }
                            error={currentErrors.executionOrder}
                            required
                          />
                          <TextField
                            label="Observações do exercício"
                            id={`section-${sectionIndex}-exercise-${index}-notes`}
                            value={exercise.notes}
                            optional
                            onChange={(event) =>
                              updateExercise(
                                sectionIndex,
                                index,
                                "notes",
                                event.target.value,
                              )
                            }
                            placeholder="Controlar descida"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.addExerciseRow}>
                  <Button
                    variant="secondary"
                    leftIcon={<PlusCircle size={18} />}
                    onClick={() => addExercise(sectionIndex)}
                    disabled={isPending}
                  >
                    Adicionar exercicio em {section.name || "bloco"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.addExerciseRow}>
          <Button
            variant="secondary"
            leftIcon={<PlusCircle size={18} />}
            onClick={addSection}
            disabled={isPending}
          >
            Adicionar bloco
          </Button>
        </div>
      </section>
    </Form>
  );
};

