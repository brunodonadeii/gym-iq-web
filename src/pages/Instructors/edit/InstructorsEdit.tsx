import { Button } from "@/components/Button/Button";
import { DetailLoadState } from "@/components/DetailLoadState/DetailLoadState";
import { Form } from "@/components/Form/Form";
import { TextField } from "@/components/TextField/TextField";
import { useFormInputs } from "@/hooks/useFormInputs";
import { useUpdateInstructor } from "@/mutations/useUpdateInstructor";
import { SpecialtySelector } from "@/pages/Instructors/components/SpecialtySelector";
import type {
  Instructor,
  InstructorUpdateFormData,
} from "@/pages/Instructors/types";
import { useGetInstructorById } from "@/queries/useGetInstructorById";
import { auth } from "@/utils/auth";
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
        specialty: details.specialty ?? "",
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
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const { set, setMasked } = useFormInputs(setData);
  const { mutate, isPending } = useUpdateInstructor();

  const validate = () => {
    const nextErrors: Partial<Record<string, string>> = {};

    if (!data.name.trim()) nextErrors.name = "Informe o nome.";
    if (!data.email.trim()) nextErrors.email = "Informe o e-mail.";
    if (!data.cref.trim()) nextErrors.cref = "Informe o CREF.";
    if (!data.phone.trim()) nextErrors.phone = "Informe o telefone.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    mutate(
      { id: instructorId, data },
      {
        onSuccess: () => {
          toast.success("Instrutor editado com sucesso!");
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
      title="Detalhes do instrutor"
      description="Atualize dados profissionais e de contato."
      loading={isLoading}
      actions={
        <>
          <Button
            onClick={() => navigate({ to: "/instructors" })}
            disabled={isPending}
          >
            {isAdmin ? "Cancelar" : "Voltar"}
          </Button>
          {isAdmin && (
            <Button onClick={handleSubmit} loading={isPending}>
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
            set("cref")(event);
            setErrors((prev) => ({ ...prev, cref: undefined }));
          }}
          placeholder="123456-G/SP"
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
          placeholder="(11) 99999-9999"
          disabled={!isAdmin}
          error={errors.phone}
          required
        />
      </div>

      <div className={styles.row}>
        <SpecialtySelector
          value={data.specialty}
          onChange={(value) =>
            setData((prev) => ({
              ...prev,
              specialty: value,
            }))
          }
          disabled={!isAdmin}
        />
      </div>

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

