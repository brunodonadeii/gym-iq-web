import { Button } from "@/components/Button/Button";
import { Form } from "@/components/Form/Form";
import { TextField } from "@/components/TextField/TextField";
import { useFormInputs } from "@/hooks/useFormInputs";
import { useCreateExercise } from "@/mutations/useCreateExercise";
import type { ExerciseFormData } from "@/pages/Exercises/types";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import styles from "./ExercisesCreate.module.css";

const EMPTY_FORM: ExerciseFormData = {
  name: "",
  muscleGroup: "",
  description: "",
};

export const ExercisesCreate = () => {
  const [data, setData] = useState<ExerciseFormData>(EMPTY_FORM);
  const { set } = useFormInputs(setData);
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateExercise();

  const handleSubmit = () => {
    mutate(
      { data },
      {
        onSuccess: () => {
          toast.success("Exercício criado com sucesso!");
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
      title="Dados do exercício"
      description="Cadastre as informações essenciais para reutilizar o exercício nas fichas."
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
          placeholder="Peito, costas, pernas..."
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="Descrição"
          id="description"
          value={data.description}
          onChange={set("description")}
          placeholder="Observacao curta"
        />
      </div>
    </Form>
  );
};
