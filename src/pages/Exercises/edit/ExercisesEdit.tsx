import { Button } from "@/components/Button/Button";
import { Form } from "@/components/Form/Form";
import { TextField } from "@/components/TextField/TextField";
import { useFormInputs } from "@/hooks/useFormInputs";
import { useUpdateExercise } from "@/mutations/useUpdateExercise";
import type { ExerciseFormData } from "@/pages/Exercises/types";
import { useGetExerciseById } from "@/queries/useGetExerciseById";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import styles from "./ExercisesEdit.module.css";

const EMPTY_FORM: ExerciseFormData = {
  name: "",
  muscleGroup: "",
  description: "",
};

export const ExercisesEdit = () => {
  const params = useParams({ strict: false });
  const exerciseId = params.exerciseId;
  const [data, setData] = useState<ExerciseFormData>(EMPTY_FORM);
  const { set } = useFormInputs(setData);
  const navigate = useNavigate();
  const { data: details, isLoading } = useGetExerciseById(exerciseId);
  const { mutate, isPending } = useUpdateExercise();

  useEffect(() => {
    if (!details) return;

    setData({
      name: details.name ?? "",
      muscleGroup: details.muscleGroup ?? "",
      description: details.description ?? "",
    });
  }, [details]);

  const handleSubmit = () => {
    mutate(
      { id: String(exerciseId), data },
      {
        onSuccess: () => {
          toast.success("Exercicio editado com sucesso!");
          navigate({ to: "/exercises" });
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
      title="Dados do exercicio"
      description="Atualize as informacoes usadas nas fichas de treino."
      loading={isLoading}
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
          label="Descricao"
          id="description"
          value={data.description}
          onChange={set("description")}
        />
      </div>
    </Form>
  );
};
