import { Button } from "@/components/Button/Button";
import { Form } from "@/components/Form/Form";
import { SelectField } from "@/components/SelectField/SelectField";
import { TextField } from "@/components/TextField/TextField";
import { useFormInputs } from "@/hooks/useFormInputs";
import { useUpdateAdminUser } from "@/mutations/useUpdateAdminUser";
import type {
  AdminUserRole,
  AdminUserUpdateFormData,
} from "@/pages/AdminUsers/types";
import { useGetAdminUserById } from "@/queries/useGetAdminUserById";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import styles from "../create/AdminUsersCreate.module.css";

const roleOptions = [
  { label: "Recepção", value: "RECEPTION" },
  { label: "Administrador", value: "ADMIN" },
];

type FormErrors = Partial<Record<keyof AdminUserUpdateFormData, string>>;

const validate = (data: AdminUserUpdateFormData) => {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = "Informe o nome do usuário.";
  }

  if (!data.email.trim()) {
    errors.email = "Informe o e-mail.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Informe um e-mail válido.";
  }

  if (!["ADMIN", "RECEPTION"].includes(data.role)) {
    errors.role = "Escolha uma permissão válida.";
  }

  return errors;
};

const focusFirstError = (errors: FormErrors) => {
  const firstField = Object.keys(errors)[0];
  if (!firstField) return;

  document.getElementById(firstField)?.focus();
};

type AdminUsersEditFormProps = {
  userId: string;
  initialData: AdminUserUpdateFormData;
};

const AdminUsersEditForm = ({
  userId,
  initialData,
}: AdminUsersEditFormProps) => {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminUserUpdateFormData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const { set } = useFormInputs(setData);
  const { mutate, isPending } = useUpdateAdminUser();

  const handleSubmit = () => {
    const nextErrors = validate(data);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      focusFirstError(nextErrors);
      return;
    }

    mutate(
      {
        id: userId,
        data: {
          ...data,
          name: data.name.trim(),
          email: data.email.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success("Usuário administrativo atualizado com sucesso.");
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
      title="Editar usuário administrativo"
      description="Atualize dados de acesso interno. A senha não é alterada nesta tela."
      loading={false}
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
        Use apenas permissões administrativas internas. Esta rota não deve ser
        usada para alunos ou instrutores.
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
    </Form>
  );
};

export const AdminUsersEdit = () => {
  const navigate = useNavigate();
  const { userId } = useParams({ from: "/_sidebar/admin-users/$userId" });
  const { data: user, isLoading } = useGetAdminUserById(userId);

  if (isLoading) {
    return (
      <Form
        title="Editar usuário administrativo"
        description="Atualize dados de acesso interno. A senha não é alterada nesta tela."
        loading
        actions={
          <Button
            variant="secondary"
            onClick={() => navigate({ to: "/admin-users" })}
          >
            Voltar
          </Button>
        }
      >
        <div />
      </Form>
    );
  }

  if (!user) {
    return (
      <Form
        title="Usuário não encontrado"
        description="Não foi possível carregar este usuário administrativo."
        actions={
          <Button
            variant="secondary"
            onClick={() => navigate({ to: "/admin-users" })}
          >
            Voltar
          </Button>
        }
      >
        <div className={styles.notice}>
          Verifique se o usuário ainda existe ou tente novamente pela listagem.
        </div>
      </Form>
    );
  }

  return (
    <AdminUsersEditForm
      key={userId}
      userId={userId}
      initialData={{
        name: user.name ?? "",
        email: user.email ?? "",
        role: user.role ?? "RECEPTION",
        lgpdAccepted: user.lgpdAccepted ?? true,
      }}
    />
  );
};


