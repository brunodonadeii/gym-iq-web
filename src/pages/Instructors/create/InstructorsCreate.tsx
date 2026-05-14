import { Button } from "@/components/Button/Button";
import { Form } from "@/components/Form/Form";
import { TextField } from "@/components/TextField/TextField";
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
};

export const InstructorsCreate = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<InstructorCreateFormData>(EMPTY_FORM);
  const { set, setMasked } = useFormInputs(setData);
  const { mutate, isPending } = useCreateInstructor();

  const canSubmit =
    data.name && data.email && data.password && data.cref && data.phone;

  const handleSubmit = () => {
    mutate(data, {
      onSuccess: () => {
        toast.success("Instrutor criado com sucesso!");
        navigate({ to: "/instructors" });
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
          <Button onClick={handleSubmit} loading={isPending} disabled={!canSubmit}>
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
          onChange={set("name")}
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
          required
        />
        <TextField
          label="Senha"
          type="password"
          id="password"
          value={data.password}
          onChange={set("password")}
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
          required
        />
        <TextField
          label="Telefone"
          id="phone"
          value={data.phone}
          onChange={setMasked("phone", "(##) #####-####")}
          placeholder="(11) 99999-9999"
          required
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="Especialidade"
          id="specialty"
          value={data.specialty}
          onChange={set("specialty")}
          placeholder="Musculacao"
        />
      </div>
    </Form>
  );
};
