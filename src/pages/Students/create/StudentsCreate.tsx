import { Button } from "@/components/Button/Button";
import { Form } from "@/components/Form/Form";
import { LgpdConsent } from "@/components/LgpdConsent/LgpdConsent";
import { TextField } from "@/components/TextField/TextField";
import { useFormInputs } from "@/hooks/useFormInputs";
import { useCreateStudent } from "@/mutations/useCreateStudent";
import type { StudentCreateFormData } from "@/pages/Students/types";
import { getApiFieldErrors } from "@/utils/apiError";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import styles from "./StudentsCreate.module.css";

const EMPTY_FORM: StudentCreateFormData = {
  name: "",
  email: "",
  password: "",
  cpf: "",
  birthDate: "",
  phone: "",
  zipCode: "",
  address: "",
  lgpdAccepted: false,
};

const STUDENT_CREATE_FIELDS = [
  "name",
  "email",
  "password",
  "cpf",
  "birthDate",
  "phone",
  "zipCode",
  "address",
  "lgpdAccepted",
] as const;

export const StudentsCreate = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<StudentCreateFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const { set, setMasked } = useFormInputs(setData);
  const { mutate: mutateCreate, isPending } = useCreateStudent();

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
    if (!data.cpf.trim()) nextErrors.cpf = "Informe o CPF.";
    if (!data.birthDate) nextErrors.birthDate = "Informe a data de nascimento.";
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

    mutateCreate(data, {
      onSuccess: () => {
        toast.success("Aluno criado com sucesso!");
        navigate({ to: "/students" });
      },
      onError: (e) => {
        const fieldErrors = getApiFieldErrors(e, STUDENT_CREATE_FIELDS);
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
    });
  };

  return (
    <Form
      title="Dados pessoais"
      description="Informações base para identificar o aluno e iniciar o acesso."
      onSubmit={handleSubmit}
      actions={
        <>
          <Button
            onClick={() => navigate({ to: "/students" })}
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
          label="CPF"
          id="cpf"
          value={data.cpf}
          onChange={(event) => {
            setMasked("cpf", "###.###.###-##")(event);
            setErrors((prev) => ({ ...prev, cpf: undefined }));
          }}
          placeholder="000.000.000-00"
          error={errors.cpf}
          required
        />
        <TextField
          label="Data de nascimento"
          type="date"
          id="birthDate"
          value={data.birthDate}
          onChange={(event) => {
            set("birthDate")(event);
            setErrors((prev) => ({ ...prev, birthDate: undefined }));
          }}
          error={errors.birthDate}
          required
        />
      </div>

      <div className={styles.row}>
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

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Endereço</legend>
        <div className={styles.row}>
          <TextField
            label="CEP"
            id="zipCode"
            value={data.zipCode}
            onChange={setMasked("zipCode", "#####-###")}
            placeholder="00000-000"
            optional
          />
        </div>
      </fieldset>

      <LgpdConsent
        checked={data.lgpdAccepted}
        error={errors.lgpdAccepted}
        onChange={(checked) => {
          setData((prev) => ({ ...prev, lgpdAccepted: checked }));
          setErrors((prev) => ({ ...prev, lgpdAccepted: undefined }));
        }}
      />
    </Form>
  );
};


