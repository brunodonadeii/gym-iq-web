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
} from "@/pages/WorkoutSheets/types";
import { useGetExercises } from "@/queries/useGetExercises";
import { useGetInstructors } from "@/queries/useGetInstructors";
import { useGetMyInstructor } from "@/queries/useGetMyInstructor";
import { useGetStudentOptions } from "@/queries/useGetStudentOptions";
import { auth } from "@/utils/auth";
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
  trainingSection: "Treino A",
  executionOrder: String(executionOrder),
  notes: "",
});

const EMPTY_FORM: WorkoutSheetFormData = {
  studentId: "",
  instructorId: "",
  name: "",
  goal: "",
  startDate: "",
  endDate: "",
  notes: "",
  exercises: [createEmptyExercise(1)],
};

type SheetField = "studentId" | "instructorId" | "name";
type ExerciseField = keyof WorkoutSheetExerciseFormData;

type FormErrors = Partial<Record<SheetField, string>> & {
  exercises?: Array<Partial<Record<ExerciseField, string>>>;
};

const focusField = (id: string) => {
  document.getElementById(id)?.focus();
};

const validate = (data: WorkoutSheetFormData) => {
  const errors: FormErrors = {};
  const exerciseErrors: FormErrors["exercises"] = [];

  if (!data.studentId) {
    errors.studentId = "Selecione o aluno.";
  }

  if (!data.instructorId) {
    errors.instructorId = "Selecione o instrutor.";
  }

  if (!data.name.trim()) {
    errors.name = "Informe o nome da ficha.";
  }

  data.exercises.forEach((exercise, index) => {
    const current: Partial<Record<ExerciseField, string>> = {};

    if (!exercise.exerciseId) {
      current.exerciseId = "Selecione o exercicio.";
    }

    if (!exercise.sets || Number(exercise.sets) <= 0) {
      current.sets = "Informe um numero de series maior que zero.";
    }

    if (!exercise.repetitions.trim()) {
      current.repetitions = "Informe as repeticoes.";
    }

    if (!exercise.trainingSection.trim()) {
      current.trainingSection = "Informe o bloco do treino.";
    }

    if (!exercise.executionOrder || Number(exercise.executionOrder) <= 0) {
      current.executionOrder = "Informe uma ordem maior que zero.";
    }

    if (Object.keys(current).length > 0) {
      exerciseErrors[index] = current;
    }
  });

  if (exerciseErrors.length > 0) {
    errors.exercises = exerciseErrors;
  }

  return errors;
};

const focusFirstError = (errors: FormErrors) => {
  if (errors.studentId) return focusField("studentId");
  if (errors.instructorId) return focusField("instructorId");
  if (errors.name) return focusField("name");

  const exerciseIndex = errors.exercises?.findIndex(Boolean) ?? -1;
  if (exerciseIndex < 0) return;

  const exerciseError = errors.exercises?.[exerciseIndex];
  const firstField = Object.keys(exerciseError ?? {})[0];

  if (firstField) {
    focusField(`exercise-${exerciseIndex}-${firstField}`);
  }
};

export const WorkoutSheetsCreate = () => {
  const isInstructor = auth.hasAnyRole(["INSTRUCTOR"]);
  const [data, setData] = useState<WorkoutSheetFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [studentSearch, setStudentSearch] = useState("");
  const [instructorSearch, setInstructorSearch] = useState("");
  const [exerciseSearches, setExerciseSearches] = useState([""]);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const debouncedStudentSearch = useDebouncedValue(studentSearch);
  const debouncedInstructorSearch = useDebouncedValue(instructorSearch);
  const debouncedExerciseSearch = useDebouncedValue(
    exerciseSearches[activeExerciseIndex] ?? "",
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
  const effectiveData: WorkoutSheetFormData = {
    ...data,
    instructorId: effectiveInstructorId,
  };

  const clearError = (
    field: SheetField | ExerciseField,
    exerciseIndex?: number,
  ) => {
    setErrors((prev) => {
      if (exerciseIndex === undefined) {
        return { ...prev, [field]: undefined };
      }

      const nextExerciseErrors = [...(prev.exercises ?? [])];
      nextExerciseErrors[exerciseIndex] = {
        ...nextExerciseErrors[exerciseIndex],
        [field]: undefined,
      };

      return { ...prev, exercises: nextExerciseErrors };
    });
  };

  const updateExercise = (
    index: number,
    field: keyof WorkoutSheetExerciseFormData,
    value: string,
  ) => {
    setData((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise, exerciseIndex) =>
        exerciseIndex === index ? { ...exercise, [field]: value } : exercise,
      ),
    }));
    clearError(field, index);
  };

  const addExercise = () => {
    setData((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        createEmptyExercise(prev.exercises.length + 1),
      ],
    }));
    setExerciseSearches((prev) => [...prev, ""]);
  };

  const removeExercise = (index: number) => {
    setData((prev) => ({
      ...prev,
      exercises: prev.exercises
        .filter((_, exerciseIndex) => exerciseIndex !== index)
        .map((exercise, exerciseIndex) => ({
          ...exercise,
          executionOrder: String(exerciseIndex + 1),
        })),
    }));
    setExerciseSearches((prev) =>
      prev.filter((_, exerciseIndex) => exerciseIndex !== index),
    );
    setErrors((prev) => ({
      ...prev,
      exercises: prev.exercises?.filter(
        (_, exerciseIndex) => exerciseIndex !== index,
      ),
    }));
    setActiveExerciseIndex(0);
  };

  const handleSubmit = () => {
    const nextErrors = validate(effectiveData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      focusFirstError(nextErrors);
      return;
    }

    mutate(
      { data: effectiveData },
      {
        onSuccess: () => {
          toast.success("Ficha criada com sucesso!");
          navigate({ to: "/workout-sheets" });
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
    <Form
      title="Dados da ficha"
      description="Vincule aluno, instrutor, periodo de vigencia e exercicios da ficha."
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
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="Data de inicio"
          id="startDate"
          type="date"
          value={data.startDate}
          onChange={set("startDate")}
        />
        <TextField
          label="Data de fim"
          id="endDate"
          type="date"
          value={data.endDate}
          onChange={set("endDate")}
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="Observações da ficha"
          id="notes"
          value={data.notes}
          onChange={set("notes")}
          placeholder="Foco em membros superiores"
        />
      </div>

      <section className={styles.exercisesSection}>
        <div className={styles.exercisesHeader}>
          <div>
            <h3 className={styles.exercisesTitle}>Exercicios</h3>
            <p className={styles.exercisesDescription}>
              Monte a ficha com todos os exercicios antes de salvar.
            </p>
          </div>
        </div>

        <div className={styles.exerciseList}>
          {data.exercises.map((exercise, index) => {
            const currentErrors = errors.exercises?.[index] ?? {};

            return (
              <div className={styles.exerciseCard} key={index}>
                <div className={styles.exerciseCardHeader}>
                  <strong>Exercicio {index + 1}</strong>
                  {data.exercises.length > 1 && (
                    <Button
                      variant="ghost"
                      leftIcon={<Trash2 size={16} />}
                      onClick={() => removeExercise(index)}
                      disabled={isPending}
                    >
                      Remover
                    </Button>
                  )}
                </div>

                <div className={styles.row}>
                  <Autocomplete
                    label="Exercicio"
                    id={`exercise-${index}-exerciseId`}
                    search={exerciseSearches[index] ?? ""}
                    onSearchChange={(value) => {
                      setActiveExerciseIndex(index);
                      setExerciseSearches((prev) =>
                        prev.map((search, searchIndex) =>
                          searchIndex === index ? value : search,
                        ),
                      );
                      updateExercise(index, "exerciseId", "");
                    }}
                    onSelect={(option) => {
                      setExerciseSearches((prev) =>
                        prev.map((search, searchIndex) =>
                          searchIndex === index ? option.label : search,
                        ),
                      );
                      updateExercise(index, "exerciseId", option.value);
                    }}
                    onClear={() => {
                      setExerciseSearches((prev) =>
                        prev.map((search, searchIndex) =>
                          searchIndex === index ? "" : search,
                        ),
                      );
                      updateExercise(index, "exerciseId", "");
                    }}
                    options={
                      activeExerciseIndex === index ? exerciseOptions : []
                    }
                    loading={
                      activeExerciseIndex === index && isFetchingExercises
                    }
                    placeholder="Digite o nome do exercicio"
                    error={currentErrors.exerciseId}
                    required
                  />
                  <TextField
                    label="Series"
                    id={`exercise-${index}-sets`}
                    type="number"
                    value={exercise.sets}
                    onChange={(event) =>
                      updateExercise(index, "sets", event.target.value)
                    }
                    error={currentErrors.sets}
                    required
                  />
                </div>

                <div className={styles.row}>
                  <TextField
                    label="Repeticoes"
                    id={`exercise-${index}-repetitions`}
                    value={exercise.repetitions}
                    onChange={(event) =>
                      updateExercise(index, "repetitions", event.target.value)
                    }
                    placeholder="10-12"
                    error={currentErrors.repetitions}
                    required
                  />
                  <TextField
                    label="Bloco do treino"
                    id={`exercise-${index}-trainingSection`}
                    value={exercise.trainingSection}
                    onChange={(event) =>
                      updateExercise(
                        index,
                        "trainingSection",
                        event.target.value,
                      )
                    }
                    placeholder="Treino A"
                    error={currentErrors.trainingSection}
                    required
                  />
                </div>

                <div className={styles.row}>
                  <TextField
                    label="Descanso em segundos"
                    id={`exercise-${index}-restSeconds`}
                    type="number"
                    value={exercise.restSeconds}
                    onChange={(event) =>
                      updateExercise(index, "restSeconds", event.target.value)
                    }
                  />
                </div>

                <div className={styles.row}>
                  <TextField
                    label="Ordem"
                    id={`exercise-${index}-executionOrder`}
                    type="number"
                    value={exercise.executionOrder}
                    onChange={(event) =>
                      updateExercise(
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
                    id={`exercise-${index}-notes`}
                    value={exercise.notes}
                    onChange={(event) =>
                      updateExercise(index, "notes", event.target.value)
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
            onClick={addExercise}
            disabled={isPending}
          >
            Adicionar exercicio
          </Button>
        </div>
      </section>
    </Form>
  );
};

