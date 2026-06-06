import { Button } from "@/components/Button/Button";
import { DetailLoadState } from "@/components/DetailLoadState/DetailLoadState";
import { Form } from "@/components/Form/Form";
import { SelectField } from "@/components/SelectField/SelectField";
import { TextField } from "@/components/TextField/TextField";
import { useFormInputs } from "@/hooks/useFormInputs";
import { useUpdateInstructor } from "@/mutations/useUpdateInstructor";
import {
  formatCrefInput,
  INSTRUCTOR_LIMITS,
  type InstructorFormErrors,
  validateInstructorUpdate,
} from "@/pages/Instructors/instructorValidation";
import {
  INSTRUCTOR_SPECIALTY_OPTIONS,
  normalizeInstructorSpecialty,
} from "@/pages/Instructors/specialties";
import type {
  Instructor,
  InstructorUpdateFormData,
} from "@/pages/Instructors/types";
import { useGetInstructorById } from "@/queries/useGetInstructorById";
import { auth } from "@/utils/auth";
import { getApiFieldErrors } from "@/utils/apiError";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import styles from "./InstructorsEdit.module.css";

const EMPTY_FORM: InstructorUpdateFormData = {
  name: "",
  email: "",
  cref: "",
  phone: "",
  specialty: "",
  lgpdAccepted: false,
};

const INSTRUCTOR_FIELDS = [
  "name",
  "email",
  "cref",
  "phone",
  "specialty",
  "lgpdAccepted",
] as const;

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Nao informado";

const getInitialFormData = (
  details?: Instructor,
): InstructorUpdateFormData =>
  details
    ? {
        name: details.name,
        email: details.email,
        cref: details.cref,
        phone: details.phone,
        specialty: normalizeInstructorSpecialty(details.specialty),
        lgpdAccepted: details.lgpdAccepted,
      }
    : EMPTY_FORM;

type InstructorsEditFormProps = {
  instructorId: string;
  details?: Instructor;
  initialData: InstructorUpdateFormData;
  isLoading: boolean;
};

const InstructorsEditForm = ({
  instructorId,
  details,
  initialData,
  isLoading,
}: InstructorsEditFormProps) => {
  const isAdmin = auth.hasAnyRole(["ADMIN"]);
  const navigate = useNavigate();
  const [data, setData] = useState<InstructorUpdateFormData>(initialData);
  const [errors, setErrors] = useState<InstructorFormErrors>({});
  const { set, setMasked } = useFormInputs(setData);
  const { mutate, isPending } = useUpdateInstructor();

  const focusFirstError = (nextErrors: InstructorFormErrors) => {
    const firstField = Object.keys(nextErrors)[0];
    if (!firstField) return;

    if (firstField === "specialty") {
      document.querySelector<HTMLButtonElement>(
        'button[aria-label="Especialidade"]',
      )?.focus();
      return;
    }

    document.getElementById(firstField)?.focus();
  };

  const validate = () => {
    const nextErrors = validateInstructorUpdate(data);
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
        id: instructorId,
        data: {
          ...data,
          name: data.name.trim(),
          email: data.email.trim(),
          cref: data.cref.trim(),
          phone: data.phone.trim(),
          specialty: data.specialty.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success("Instrutor editado com sucesso!");
        },
        onError: (e) => {
          const fieldErrors = getApiFieldErrors(e, INSTRUCTOR_FIELDS);

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
      title="Detalhes do instrutor"
      description="Atualize dados profissionais e de contato."
      loading={isLoading}
      onSubmit={isAdmin ? handleSubmit : undefined}
      actions={
        <>
          <Button
            onClick={() => navigate({ to: "/instructors" })}
            disabled={isPending}
          >
            {isAdmin ? "Cancelar" : "Voltar"}
          </Button>
          {isAdmin && (
            <Button type="submit" loading={isPending}>
              Salvar
            </Button>
          )}
        </>
      }
    >
      {details && (
        <section className={styles.summary}>
          <div className={styles.summaryItem}>
            <span>ID do instrutor</span>
            <strong>#{details.instructorId}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Usuario</span>
            <strong>#{details.userId}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Status</span>
            <strong>{details.active ? "Ativo" : "Inativo"}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Criado em</span>
            <strong>{formatDate(details.createdAt)}</strong>
          </div>
        </section>
      )}

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
          disabled={!isAdmin}
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
          disabled={!isAdmin}
          error={errors.email}
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
          disabled={!isAdmin}
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
          disabled={!isAdmin}
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
          disabled={!isAdmin}
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
          disabled={!isAdmin}
          aria-invalid={Boolean(errors.lgpdAccepted)}
          aria-describedby={
            errors.lgpdAccepted ? "lgpdAccepted-error" : undefined
          }
          required
        />
        <span>
          Confirmo o aceite dos termos de LGPD para atualizar o cadastro deste
          instrutor.
          <span className={styles.requiredMark} aria-hidden="true">
            {" *"}
          </span>
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

export const InstructorsEdit = () => {
  const params = useParams({ strict: false });
  const instructorId = params.instructorId;
  const navigate = useNavigate();
  const { data: details, error, isError, isLoading } =
    useGetInstructorById(instructorId);

  if (isError || (!isLoading && !details)) {
    return (
      <DetailLoadState
        entity={{ name: "Instrutor", article: "este", pronoun: "ele" }}
        error={error}
        onBack={() => navigate({ to: "/instructors" })}
      />
    );
  }

  return (
    <InstructorsEditForm
      key={details?.instructorId ?? "loading"}
      instructorId={instructorId}
      details={details}
      initialData={getInitialFormData(details)}
      isLoading={isLoading}
    />
  );
};

