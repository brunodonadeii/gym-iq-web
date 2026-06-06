import { Button } from "@/components/Button/Button";
import { DetailLoadState } from "@/components/DetailLoadState/DetailLoadState";
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
  const [errors, setErrors] = useState<Partial<Record<keyof ExerciseFormData, string>>>({});
  const { set } = useFormInputs(setData);
  const navigate = useNavigate();
  const { mutate, isPending } = useUpdateExercise();

  const validate = () => {
    const nextErrors: Partial<Record<keyof ExerciseFormData, string>> = {};

    if (!data.name.trim()) nextErrors.name = "Informe o nome.";
    if (!data.muscleGroup.trim()) {
      nextErrors.muscleGroup = "Informe o grupo muscular.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

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
      title="Dados do exercício"
      description="Atualize as informações usadas nas fichas de treino."
      loading={loading}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button
            onClick={() => navigate({ to: "/exercises" })}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={isPending}>
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
          onChange={(event) => {
            set("name")(event);
            setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          error={errors.name}
          required
        />
        <TextField
          label="Grupo muscular"
          id="muscleGroup"
          value={data.muscleGroup}
          onChange={(event) => {
            set("muscleGroup")(event);
            setErrors((prev) => ({ ...prev, muscleGroup: undefined }));
          }}
          error={errors.muscleGroup}
          required
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="Descrição"
          id="description"
          value={data.description}
          onChange={set("description")}
          optional
        />
      </div>
    </Form>
  );
};

export const ExercisesEdit = () => {
  const params = useParams({ strict: false });
  const exerciseId = params.exerciseId;
  const navigate = useNavigate();
  const { data: details, error, isError, isLoading } =
    useGetExerciseById(exerciseId);
  const initialData = isLoading ? EMPTY_FORM : mapExerciseToForm(details);

  if (isError || (!isLoading && !details)) {
    return (
      <DetailLoadState
        entity={{ name: "Exercício", article: "este", pronoun: "ele" }}
        error={error}
        onBack={() => navigate({ to: "/exercises" })}
      />
    );
  }

  return (
    <ExercisesEditForm
      key={`${exerciseId ?? "new"}-${isLoading}`}
      exerciseId={exerciseId}
      initialData={initialData}
      loading={isLoading}
    />
  );
};


