import { Button } from "@/components/Button/Button";
import { Form } from "@/components/Form/Form";
import { TextField } from "@/components/TextField/TextField";
import { useFormInputs } from "@/hooks/useFormInputs";
import { useUpdateExercise } from "@/mutations/useUpdateExercise";
import type { Exercise, ExerciseFormData } from "@/pages/Exercises/types";
import { useGetExerciseById } from "@/queries/useGetExerciseById";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import styles from "./ExercisesEdit.module.css";

const EMPTY_FORM: ExerciseFormData = {
  name: "",
  muscleGroup: "",
  description: "",
};

const mapExerciseToForm = (details?: Exercise): ExerciseFormData => ({
  name: details?.name ?? "",
  muscleGroup: details?.muscleGroup ?? "",
  description: details?.description ?? "",
});

type ExercisesEditFormProps = {
  exerciseId?: string;
  initialData: ExerciseFormData;
  loading: boolean;
};

const ExercisesEditForm = ({
  exerciseId,
  initialData,
  loading,
}: ExercisesEditFormProps) => {
  const [data, setData] = useState<ExerciseFormData>(initialData);
  const { set } = useFormInputs(setData);
  const navigate = useNavigate();
  const { mutate, isPending } = useUpdateExercise();

  const handleSubmit = () => {
    mutate(
      { id: String(exerciseId), data },
      {
        onSuccess: () => {
          toast.success("Exercício editado com sucesso!");
          navigate({ to: "/exercises" });
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
    <Form
      title="Dados do exercício"
      description="Atualize as informações usadas nas fichas de treino."
      loading={loading}
      actions={
        <>
          <Button
            onClick={() => navigate({ to: "/exercises" })}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isPending}
            disabled={!data.name || !data.muscleGroup}
          >
            Salvar
          </Button>
        </>
      }
    >
      <div className={styles.row}>
        <TextField
          label="Nome"
          id="name"
          value={data.name}
          onChange={set("name")}
          required
        />
        <TextField
          label="Grupo muscular"
          id="muscleGroup"
          value={data.muscleGroup}
          onChange={set("muscleGroup")}
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="Descrição"
          id="description"
          value={data.description}
          onChange={set("description")}
        />
      </div>
    </Form>
  );
};

export const ExercisesEdit = () => {
  const params = useParams({ strict: false });
  const exerciseId = params.exerciseId;
  const { data: details, isLoading } = useGetExerciseById(exerciseId);
  const initialData = isLoading ? EMPTY_FORM : mapExerciseToForm(details);

  return (
    <ExercisesEditForm
      key={`${exerciseId ?? "new"}-${isLoading}`}
      exerciseId={exerciseId}
      initialData={initialData}
      loading={isLoading}
    />
  );
};


