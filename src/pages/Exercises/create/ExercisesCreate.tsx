import { Button } from "@/components/Button/Button";
import { Form } from "@/components/Form/Form";
import { TextField } from "@/components/TextField/TextField";
import { useFormInputs } from "@/hooks/useFormInputs";
import { useCreateExercise } from "@/mutations/useCreateExercise";
import {
  EXERCISE_LIMITS,
  type ExerciseFormData,
} from "@/pages/Exercises/types";
import { getApiFieldErrors } from "@/utils/apiError";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import styles from "./ExercisesCreate.module.css";

const EMPTY_FORM: ExerciseFormData = {
  name: "",
  muscleGroup: "",
  description: "",
};

const EXERCISE_FIELDS = ["name", "muscleGroup", "description"] as const;

export const ExercisesCreate = () => {
  const [data, setData] = useState<ExerciseFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ExerciseFormData, string>>
  >({});
  const { set } = useFormInputs(setData);
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateExercise();

  const validate = () => {
    const nextErrors: Partial<Record<keyof ExerciseFormData, string>> = {};

    if (!data.name.trim()) {
      nextErrors.name = "Informe o nome.";
    } else if (data.name.length > EXERCISE_LIMITS.name) {
      nextErrors.name = `Use no máximo ${EXERCISE_LIMITS.name} caracteres.`;
    }

    if (!data.muscleGroup.trim()) {
      nextErrors.muscleGroup = "Informe o grupo muscular.";
    } else if (data.muscleGroup.length > EXERCISE_LIMITS.muscleGroup) {
      nextErrors.muscleGroup = `Use no máximo ${EXERCISE_LIMITS.muscleGroup} caracteres.`;
    }

    if (data.description.length > EXERCISE_LIMITS.description) {
      nextErrors.description = `Use no máximo ${EXERCISE_LIMITS.description} caracteres.`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    mutate(
      { data },
      {
        onSuccess: () => {
          toast.success("Exercício criado com sucesso!");
          navigate({ to: "/exercises" });
        },
        onError: (e) => {
          const fieldErrors = getApiFieldErrors(e, EXERCISE_FIELDS);
          if (fieldErrors) {
            setErrors(fieldErrors);
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
      title="Dados do exercício"
      description="Cadastre as informações essenciais para reutilizar o exercício nas fichas."
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
          maxLength={EXERCISE_LIMITS.name}
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
          placeholder="Peito, costas, pernas..."
          error={errors.muscleGroup}
          maxLength={EXERCISE_LIMITS.muscleGroup}
          required
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="Descrição"
          id="description"
          value={data.description}
          onChange={(event) => {
            set("description")(event);
            setErrors((prev) => ({ ...prev, description: undefined }));
          }}
          maxLength={EXERCISE_LIMITS.description}
          placeholder="Observação curta"
          helperText={`${data.description.length}/${EXERCISE_LIMITS.description} caracteres.`}
          error={errors.description}
          optional
        />
      </div>
    </Form>
  );
};


