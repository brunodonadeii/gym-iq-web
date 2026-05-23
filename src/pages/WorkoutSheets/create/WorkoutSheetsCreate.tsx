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
import { useGetStudentOptions } from "@/queries/useGetStudentOptions";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import styles from "./WorkoutSheetsCreate.module.css";

const EMPTY_EXERCISE: WorkoutSheetExerciseFormData = {
  exerciseId: "",
  sets: "",
  repetitions: "",
  loadKg: "",
  restSeconds: "",
  executionOrder: "1",
  notes: "",
};

const EMPTY_FORM: WorkoutSheetFormData = {
  studentId: "",
  instructorId: "",
  name: "",
  goal: "",
  startDate: "",
  endDate: "",
  notes: "",
  exercises: [EMPTY_EXERCISE],
};

export const WorkoutSheetsCreate = () => {
  const [data, setData] = useState<WorkoutSheetFormData>(EMPTY_FORM);
  const [studentSearch, setStudentSearch] = useState("");
  const [instructorSearch, setInstructorSearch] = useState("");
  const [exerciseSearch, setExerciseSearch] = useState("");
  const debouncedStudentSearch = useDebouncedValue(studentSearch);
  const debouncedInstructorSearch = useDebouncedValue(instructorSearch);
  const debouncedExerciseSearch = useDebouncedValue(exerciseSearch);
  const { set } = useFormInputs(setData);
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateWorkoutSheet();
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

  const firstExercise = data.exercises[0] ?? EMPTY_EXERCISE;

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

  const updateFirstExercise = (
    field: keyof WorkoutSheetExerciseFormData,
    value: string,
  ) => {
    setData((prev) => ({
      ...prev,
      exercises: [
        {
          ...(prev.exercises[0] ?? EMPTY_EXERCISE),
          [field]: value,
        },
      ],
    }));
  };

  const handleSubmit = () => {
    mutate(
      { data },
      {
        onSuccess: () => {
          toast.success("Ficha criada com sucesso!");
          navigate({ to: "/workout-sheets" });
        },
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
    <Form
      title="Dados da ficha"
      description="Vincule aluno, instrutor e período de vigência da ficha."
      loading={false}
      actions={
        <>
          <Button
            onClick={() => navigate({ to: "/workout-sheets" })}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isPending}
            disabled={
              !data.studentId ||
              !data.instructorId ||
              !data.name ||
              !firstExercise.exerciseId ||
              !firstExercise.sets ||
              !firstExercise.repetitions ||
              !firstExercise.executionOrder
            }
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
          }}
          onSelect={(option) => {
            setStudentSearch(option.label);
            setData((prev) => ({ ...prev, studentId: option.value }));
          }}
          onClear={() => {
            setStudentSearch("");
            setData((prev) => ({ ...prev, studentId: "" }));
          }}
          options={autocompleteStudentOptions}
          loading={isFetchingStudents}
          placeholder="Digite nome, CPF ou e-mail"
          required
        />
        <Autocomplete
          label="Instrutor"
          id="instructorId"
          search={instructorSearch}
          onSearchChange={(value) => {
            setInstructorSearch(value);
            setData((prev) => ({ ...prev, instructorId: "" }));
          }}
          onSelect={(option) => {
            setInstructorSearch(option.label);
            setData((prev) => ({ ...prev, instructorId: option.value }));
          }}
          onClear={() => {
            setInstructorSearch("");
            setData((prev) => ({ ...prev, instructorId: "" }));
          }}
          options={instructorOptions}
          loading={isFetchingInstructors}
          placeholder="Digite nome, CREF ou e-mail"
          required
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="Nome da ficha"
          id="name"
          value={data.name}
          onChange={set("name")}
          placeholder="Treino A"
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
          label="Data de início"
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

      <div className={styles.row}>
        <Autocomplete
          label="Exercício inicial"
          id="exerciseId"
          search={exerciseSearch}
          onSearchChange={(value) => {
            setExerciseSearch(value);
            updateFirstExercise("exerciseId", "");
          }}
          onSelect={(option) => {
            setExerciseSearch(option.label);
            updateFirstExercise("exerciseId", option.value);
          }}
          onClear={() => {
            setExerciseSearch("");
            updateFirstExercise("exerciseId", "");
          }}
          options={exerciseOptions}
          loading={isFetchingExercises}
          placeholder="Digite o nome do exercício"
          required
        />
        <TextField
          label="Series"
          id="sets"
          type="number"
          value={firstExercise.sets}
          onChange={(event) => updateFirstExercise("sets", event.target.value)}
          required
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="Repeticoes"
          id="repetitions"
          value={firstExercise.repetitions}
          onChange={(event) =>
            updateFirstExercise("repetitions", event.target.value)
          }
          placeholder="10-12"
          required
        />
        <TextField
          label="Carga em kg"
          id="loadKg"
          type="number"
          value={firstExercise.loadKg}
          onChange={(event) =>
            updateFirstExercise("loadKg", event.target.value)
          }
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="Descanso em segundos"
          id="restSeconds"
          type="number"
          value={firstExercise.restSeconds}
          onChange={(event) =>
            updateFirstExercise("restSeconds", event.target.value)
          }
        />
        <TextField
          label="Ordem"
          id="executionOrder"
          type="number"
          value={firstExercise.executionOrder}
          onChange={(event) =>
            updateFirstExercise("executionOrder", event.target.value)
          }
          required
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="Observações do exercício"
          id="exerciseNotes"
          value={firstExercise.notes}
          onChange={(event) => updateFirstExercise("notes", event.target.value)}
          placeholder="Controlar descida"
        />
      </div>
    </Form>
  );
};
