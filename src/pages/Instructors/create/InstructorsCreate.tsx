import { Button } from "@/components/Button/Button";
import { Form } from "@/components/Form/Form";
import { SelectField } from "@/components/SelectField/SelectField";
import { TextField } from "@/components/TextField/TextField";
import { useFormInputs } from "@/hooks/useFormInputs";
import { useCreateInstructor } from "@/mutations/useCreateInstructor";
import {
  formatCrefInput,
  getInstructorApiFieldErrors,
  INSTRUCTOR_LIMITS,
  type InstructorFormErrors,
  validateInstructorCreate,
} from "@/pages/Instructors/instructorValidation";
import { INSTRUCTOR_SPECIALTY_OPTIONS } from "@/pages/Instructors/specialties";
import type { InstructorCreateFormData } from "@/pages/Instructors/types";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import styles from "./InstructorsCreate.module.css";

const EMPTY_FORM: InstructorCreateFormData = {
  name: "",
  email: "",
  password: "",
  cref: "",
  phone: "",
  specialty: "",
  lgpdAccepted: false,
};

export const InstructorsCreate = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<InstructorCreateFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<InstructorFormErrors>({});
  const { set, setMasked } = useFormInputs(setData);
  const { mutate, isPending } = useCreateInstructor();

  const focusFirstError = (
    nextErrors: InstructorFormErrors,
  ) => {
    const firstField = Object.keys(nextErrors)[0];
    if (!firstField) return;

    if (firstField === "specialty") {
      document.querySelector<HTMLButtonElement>(
        'button[aria-label="Especialidade"]',
      )?.focus();
      return;
    }

    if (firstField === "lgpdAccepted") {
      document.getElementById("lgpdAccepted")?.focus();
      return;
    }

    document.getElementById(firstField)?.focus();
  };

  const validate = () => {
    const nextErrors = validateInstructorCreate(data);
    setErrors(nextErrors);
    return nextErrors;
  };

  const handleSubmit = () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      focusFirstError(nextErrors);
      return;
    }

    mutate(
      {
        ...data,
        name: data.name.trim(),
        email: data.email.trim(),
        cref: data.cref.trim(),
        phone: data.phone.trim(),
        specialty: data.specialty.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Instrutor criado com sucesso!");
          navigate({ to: "/instructors" });
        },
        onError: (e) => {
          const fieldErrors = getInstructorApiFieldErrors(e);

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
      title="Dados do instrutor"
      description="Cadastre acesso, contato, registro profissional e especialidade."
      onSubmit={handleSubmit}
      actions={
        <>
          <Button
            onClick={() => navigate({ to: "/instructors" })}
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
          minLength={INSTRUCTOR_LIMITS.name.minLength}
          maxLength={INSTRUCTOR_LIMITS.name.maxLength}
          helperText={`${data.name.length}/${INSTRUCTOR_LIMITS.name.maxLength} caracteres. Mínimo de ${INSTRUCTOR_LIMITS.name.minLength}.`}
          error={errors.name}
          required
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="E-mail"
          type="email"
          id="email"
          value={data.email}
          onChange={(event) => {
            set("email")(event);
            setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={errors.email}
          required
        />
        <TextField
          label="Senha"
          type="password"
          id="password"
          value={data.password}
          onChange={(event) => {
            set("password")(event);
            setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          minLength={INSTRUCTOR_LIMITS.password.minLength}
          helperText="Mínimo de 6 caracteres."
          error={errors.password}
          required
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="CREF"
          id="cref"
          value={data.cref}
          onChange={(event) => {
            setData((prev) => ({
              ...prev,
              cref: formatCrefInput(event.target.value),
            }));
            setErrors((prev) => ({ ...prev, cref: undefined }));
          }}
          maxLength={INSTRUCTOR_LIMITS.cref.maxLength}
          pattern="[0-9]{6}-[A-Za-z]/[A-Za-z]{2}"
          placeholder="123456-G/SP"
          helperText={`${data.cref.length}/${INSTRUCTOR_LIMITS.cref.maxLength} caracteres. Formato: 123456-G/SP.`}
          error={errors.cref}
          required
        />
        <TextField
          label="Telefone"
          id="phone"
          value={data.phone}
          onChange={(event) => {
            setMasked("phone", "(##) #####-####")(event);
            setErrors((prev) => ({ ...prev, phone: undefined }));
          }}
          maxLength={INSTRUCTOR_LIMITS.phone.maxLength}
          placeholder="(11) 99999-9999"
          error={errors.phone}
          required
        />
      </div>

      <div className={styles.row}>
        <SelectField
          label="Especialidade"
          id="specialty"
          value={data.specialty}
          onChange={(event) => {
            setData((prev) => ({
              ...prev,
              specialty: event.target.value,
            }));
            setErrors((prev) => ({ ...prev, specialty: undefined }));
          }}
          options={[
            {
              label: "Selecione uma especialidade",
              value: "",
              disabled: true,
            },
            ...INSTRUCTOR_SPECIALTY_OPTIONS.map((specialty) => ({
              label: specialty,
              value: specialty,
            })),
          ]}
          error={errors.specialty}
          required
        />
      </div>

      <label
        className={[
          styles.lgpdBox,
          errors.lgpdAccepted && styles.lgpdBoxError,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <input
          id="lgpdAccepted"
          type="checkbox"
          checked={data.lgpdAccepted}
          onChange={(event) => {
            setData((prev) => ({
              ...prev,
              lgpdAccepted: event.target.checked,
            }));
            setErrors((prev) => ({ ...prev, lgpdAccepted: undefined }));
          }}
          aria-invalid={Boolean(errors.lgpdAccepted)}
          aria-describedby={
            errors.lgpdAccepted ? "lgpdAccepted-error" : undefined
          }
          required
        />
        <span>
          Declaro que o instrutor aceitou o uso dos dados para cadastro e gestao
          do acesso na academia.
        </span>
      </label>
      {errors.lgpdAccepted && (
        <div className={styles.checkboxError} id="lgpdAccepted-error">
          {errors.lgpdAccepted}
        </div>
      )}
    </Form>
  );
};

