import { Button } from "@/components/Button/Button";
import { Form } from "@/components/Form/Form";
import { SelectField } from "@/components/SelectField/SelectField";
import { TextField } from "@/components/TextField/TextField";
import { useFormInputs } from "@/hooks/useFormInputs";
import { useCreateAdminUser } from "@/mutations/useCreateAdminUser";
import type { AdminUserCreateFormData } from "@/pages/AdminUsers/types";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import styles from "./AdminUsersCreate.module.css";

const EMPTY_FORM: AdminUserCreateFormData = {
  name: "",
  email: "",
  password: "",
  role: "RECEPTION",
  lgpdAccepted: true,
};

const roleOptions = [
  { label: "Recepção", value: "RECEPTION" },
  { label: "Administrador", value: "ADMIN" },
];

export const AdminUsersCreate = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminUserCreateFormData>(EMPTY_FORM);
  const { set } = useFormInputs(setData);
  const { mutate, isPending } = useCreateAdminUser();

  const canSubmit = data.name && data.email && data.password && data.role;

  const handleSubmit = () => {
    mutate(data, {
      onSuccess: () => {
        toast.success("Usuário administrativo criado com sucesso!");
        setData(EMPTY_FORM);
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
    });
  };

  return (
    <Form
      title="Cadastro administrativo"
      description="Crie acessos internos para administradores e recepção."
      actions={
        <>
          <Button onClick={() => navigate({ to: "/" })} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isPending}
            disabled={!canSubmit}
          >
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
          onChange={set("name")}
          required
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="E-mail"
          id="email"
          type="email"
          value={data.email}
          onChange={set("email")}
          required
        />
        <TextField
          label="Senha inicial"
          id="password"
          type="password"
          value={data.password}
          onChange={set("password")}
          required
        />
      </div>

      <div className={styles.row}>
        <SelectField
          label="Permissão"
          id="role"
          value={data.role}
          onChange={set("role")}
          options={roleOptions}
          required
        />
      </div>
    </Form>
  );
};
