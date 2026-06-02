import { Button } from "@/components/Button/Button";
import { Form } from "@/components/Form/Form";
import { TextField } from "@/components/TextField/TextField";
import { useFormInputs } from "@/hooks/useFormInputs";
import { useUpdateInstructor } from "@/mutations/useUpdateInstructor";
import type { InstructorUpdateFormData } from "@/pages/Instructors/types";
import { useGetInstructorById } from "@/queries/useGetInstructorById";
import { auth } from "@/utils/auth";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
    : "Não informado";

export const InstructorsEdit = () => {
  const isAdmin = auth.hasAnyRole(["ADMIN"]);
  const params = useParams({ strict: false });
  const instructorId = params.instructorId;
  const navigate = useNavigate();
  const [data, setData] = useState<InstructorUpdateFormData>(EMPTY_FORM);
  const { set, setMasked } = useFormInputs(setData);
  const { data: details, isLoading } = useGetInstructorById(instructorId);
  const { mutate, isPending } = useUpdateInstructor();

  useEffect(() => {
    if (!details) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData({
      name: details.name,
      email: details.email,
      cref: details.cref,
      phone: details.phone,
      specialty: details.specialty ?? "",
      lgpdAccepted: details.lgpdAccepted,
    });
  }, [details]);

  const canSubmit = data.name && data.email && data.cref && data.phone;

  const handleSubmit = () => {
    mutate(
      { id: instructorId, data },
      {
        onSuccess: () => {
          toast.success("Instrutor editado com sucesso!");
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
            <Button
              onClick={handleSubmit}
              loading={isPending}
              disabled={!canSubmit}
            >
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
            <span>Usuário</span>
            <strong>#{details.userId}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Status</span>
            <strong>{details.active ? "Ativo" : "Inativo"}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>LGPD</span>
            <strong>{details.lgpdAccepted ? "Aceito" : "Pendente"}</strong>
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
          onChange={set("name")}
          disabled={!isAdmin}
          required
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="E-mail"
          type="email"
          id="email"
          value={data.email}
          onChange={set("email")}
          disabled={!isAdmin}
          required
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="CREF"
          id="cref"
          value={data.cref}
          onChange={set("cref")}
          placeholder="123456-G/SP"
          disabled={!isAdmin}
          required
        />
        <TextField
          label="Telefone"
          id="phone"
          value={data.phone}
          onChange={setMasked("phone", "(##) #####-####")}
          placeholder="(11) 99999-9999"
          disabled={!isAdmin}
          required
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="Especialidade"
          id="specialty"
          value={data.specialty}
          onChange={set("specialty")}
          placeholder="Hipertrofia"
          disabled={!isAdmin}
        />
      </div>

      <label className={styles.lgpdBox}>
        <input
          type="checkbox"
          checked={data.lgpdAccepted}
          disabled={!isAdmin}
          onChange={(event) =>
            setData((prev) => ({
              ...prev,
              lgpdAccepted: event.target.checked,
            }))
          }
        />
        <span>Consentimento LGPD do instrutor confirmado.</span>
      </label>
    </Form>
  );
};


