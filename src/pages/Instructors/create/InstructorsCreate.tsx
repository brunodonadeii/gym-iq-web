import { Button } from "@/components/Button/Button";
import { Form } from "@/components/Form/Form";
import { TextField } from "@/components/TextField/TextField";
import { SpecialtySelector } from "@/pages/Instructors/components/SpecialtySelector";
import { useFormInputs } from "@/hooks/useFormInputs";
import { useCreateInstructor } from "@/mutations/useCreateInstructor";
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
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const { set, setMasked } = useFormInputs(setData);
  const { mutate, isPending } = useCreateInstructor();

  const focusFirstError = (
    nextErrors: Partial<Record<string, string>>,
  ) => {
    const firstField = Object.keys(nextErrors)[0];
    if (!firstField) return;

    if (firstField === "lgpdAccepted") {
      document.getElementById("lgpdAccepted")?.focus();
      return;
    }

    document.getElementById(firstField)?.focus();
  };

  const validate = () => {
    const nextErrors: Partial<Record<string, string>> = {};

    if (!data.name.trim()) nextErrors.name = "Informe o nome.";
    if (!data.email.trim()) nextErrors.email = "Informe o e-mail.";
    if (!data.password) nextErrors.password = "Informe a senha.";
    if (!data.cref.trim()) nextErrors.cref = "Informe o CREF.";
    if (!data.phone.trim()) nextErrors.phone = "Informe o telefone.";
    if (!data.lgpdAccepted) {
      nextErrors.lgpdAccepted = "Confirme o aceite para continuar.";
    }

    setErrors(nextErrors);
    return nextErrors;
  };

  const handleSubmit = () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      focusFirstError(nextErrors);
      return;
    }

    mutate(data, {
      onSuccess: () => {
        toast.success("Instrutor criado com sucesso!");
        navigate({ to: "/instructors" });
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
    });
  };

  return (
    <Form
      title="Dados do instrutor"
      description="Cadastre acesso, contato, registro profissional e especialidade."
      actions={
        <>
          <Button
            onClick={() => navigate({ to: "/instructors" })}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={isPending}>
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
            set("cref")(event);
            setErrors((prev) => ({ ...prev, cref: undefined }));
          }}
          placeholder="123456-G/SP"
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
        />
      </div>

      <label className={styles.lgpdBox}>
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
          required
        />
        <span>
          Declaro que o instrutor aceitou o uso dos dados para cadastro e gestao
          do acesso na academia.
        </span>
      </label>
      {errors.lgpdAccepted && (
        <div className={styles.checkboxError}>{errors.lgpdAccepted}</div>
      )}
    </Form>
  );
};
