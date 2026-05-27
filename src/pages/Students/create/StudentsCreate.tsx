import { Button } from "@/components/Button/Button";
import { Form } from "@/components/Form/Form";
import { TextField } from "@/components/TextField/TextField";
import { useFormInputs } from "@/hooks/useFormInputs";
import { useCreateStudent } from "@/mutations/useCreateStudent";
import type { StudentCreateFormData } from "@/pages/Students/types";
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

export const StudentsCreate = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<StudentCreateFormData>(EMPTY_FORM);
  const { set, setMasked } = useFormInputs(setData);
  const { mutate: mutateCreate, isPending } = useCreateStudent();
  const canSubmit =
    data.name &&
    data.email &&
    data.password &&
    data.cpf &&
    data.birthDate &&
    data.phone &&
    data.lgpdAccepted;

  const handleSubmit = async () => {
    mutateCreate(data, {
      onSuccess: () => {
        toast.success("Aluno criado com sucesso!");
        navigate({ to: "/students" });
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
      title="Dados pessoais"
      description="Informações base para identificar o aluno e iniciar o acesso."
      actions={
        <>
          <Button
            onClick={() => navigate({ to: "/students" })}
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
          label="CPF"
          id="cpf"
          value={data.cpf}
          onChange={setMasked("cpf", "###.###.###-##")}
          placeholder="000.000.000-00"
          required
        />
        <TextField
          label="Data de nascimento"
          type="date"
          id="birthDate"
          value={data.birthDate}
          onChange={set("birthDate")}
          required
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="Telefone"
          id="phone"
          value={data.phone}
          onChange={setMasked("phone", "(##) #####-####")}
          placeholder="(11) 99999-9999"
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
          />
        </div>

        <div className={styles.row}>
          <TextField
            label="Endereço completo"
            id="address"
            value={data.address}
            onChange={set("address")}
            placeholder="Rua, número, bairro, cidade - UF"
          />
        </div>
      </fieldset>

      <label className={styles.lgpdBox}>
        <input
          type="checkbox"
          checked={data.lgpdAccepted}
          onChange={(event) =>
            setData((prev) => ({
              ...prev,
              lgpdAccepted: event.target.checked,
            }))
          }
          required
        />
        <span>
          Declaro que o aluno aceitou o uso dos dados para cadastro e gestão do
          acesso na academia.
        </span>
      </label>
    </Form>
  );
};
