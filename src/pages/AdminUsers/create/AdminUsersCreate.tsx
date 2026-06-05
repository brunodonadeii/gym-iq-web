import { Button } from "@/components/Button/Button";
import { Form } from "@/components/Form/Form";
import { SelectField } from "@/components/SelectField/SelectField";
import { TextField } from "@/components/TextField/TextField";
import { useFormInputs } from "@/hooks/useFormInputs";
import { useCreateAdminUser } from "@/mutations/useCreateAdminUser";
import type {
  AdminUserCreateFormData,
  AdminUserRole,
} from "@/pages/AdminUsers/types";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import styles from "./AdminUsersCreate.module.css";

const EMPTY_FORM: AdminUserCreateFormData = {
  name: "",
  email: "",
  password: "",
  role: "RECEPTION",
  lgpdAccepted: false,
};

const roleOptions = [
  { label: "Recepção", value: "RECEPTION" },
  { label: "Administrador", value: "ADMIN" },
];

type FormErrors = Partial<Record<keyof AdminUserCreateFormData, string>>;

const validate = (data: AdminUserCreateFormData) => {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = "Informe o nome do usuário.";
  }

  if (!data.email.trim()) {
    errors.email = "Informe o e-mail.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Informe um e-mail válido.";
  }

  if (!data.password.trim()) {
    errors.password = "Informe a senha inicial.";
  } else if (data.password.length < 6) {
    errors.password = "Use pelo menos 6 caracteres.";
  }

  if (!["ADMIN", "RECEPTION"].includes(data.role)) {
    errors.role = "Escolha uma permissão válida.";
  }

  if (!data.lgpdAccepted) {
    errors.lgpdAccepted = "Confirme o aceite para continuar.";
  }

  return errors;
};

const focusFirstError = (errors: FormErrors) => {
  const firstField = Object.keys(errors)[0];
  if (!firstField) return;

  if (firstField === "lgpdAccepted") {
    document.getElementById("lgpdAccepted")?.focus();
    return;
  }

  document.getElementById(firstField)?.focus();
};

export const AdminUsersCreate = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminUserCreateFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const { set } = useFormInputs(setData);
  const { mutate, isPending } = useCreateAdminUser();

  const handleSubmit = () => {
    const nextErrors = validate(data);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      focusFirstError(nextErrors);
      return;
    }

    mutate(
      {
        ...data,
        name: data.name.trim(),
        email: data.email.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Usuário administrativo criado com sucesso.");
          navigate({ to: "/admin-users" });
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
      title="Cadastro administrativo"
      description="Crie acessos internos para administradores e recepção."
      actions={
        <>
          <Button
            variant="secondary"
            onClick={() => navigate({ to: "/admin-users" })}
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
      <div className={styles.notice}>
        Esta tela cria apenas usuários internos do sistema. Alunos e instrutores
        continuam usando seus próprios cadastros.
      </div>

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
          id="email"
          type="email"
          value={data.email}
          onChange={(event) => {
            set("email")(event);
            setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={errors.email}
          required
        />
        <TextField
          label="Senha inicial"
          id="password"
          type="password"
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
        <SelectField
          label="Permissão"
          id="role"
          value={data.role}
          onChange={(event) => {
            setData((prev) => ({
              ...prev,
              role: event.target.value as AdminUserRole,
            }));
            setErrors((prev) => ({ ...prev, role: undefined }));
          }}
          options={roleOptions}
          error={errors.role}
          required
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
          Declaro que o usuário aceitou o uso dos dados para cadastro e acesso
          interno ao sistema.
        </span>
      </label>
      {errors.lgpdAccepted && (
        <div className={styles.checkboxError}>{errors.lgpdAccepted}</div>
      )}
    </Form>
  );
};


