import { Button } from "@/components/Button/Button";
import styles from "./StudentsEdit.module.css";
import { TextField } from "@/components/TextField/TextField";
import { useUpdateStudent } from "@/mutations/useUpdateStudent";
import { useGetStudentById } from "@/queries/useGetStudentById";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { useFormInputs } from "@/hooks/useFormInputs";
import { isAnonymizedStudent, type StudentUpdateFormData } from "../types";
import { Form } from "@/components/Form/Form";

const EMPTY_FORM: StudentUpdateFormData = {
  name: "",
  email: "",
  cpf: "",
  birthDate: "",
  phone: "",
  zipCode: "",
  address: "",
};

export const StudentsEdit = () => {
  const params = useParams({ strict: false });
  const studentId = params.studentId;
  const [data, setData] = useState<StudentUpdateFormData>(EMPTY_FORM);
  const { set, setMasked } = useFormInputs(setData);
  const { mutate: mutateUpdate, isPending } = useUpdateStudent();
  const { data: details, isLoading } = useGetStudentById(studentId);
  const navigate = useNavigate();
  const anonymized = isAnonymizedStudent(details);

  useEffect(() => {
    if (details) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData({
        name: details.name,
        email: details.email,
        cpf: details.cpf,
        birthDate: details.birthDate,
        phone: details.phone,
        zipCode: details.zipCode ?? "",
        address: details.address ?? "",
      });
    }
  }, [details]);

  const handleSubmit = () => {
    mutateUpdate(
      { id: studentId, data },
      {
        onSuccess: () => {
          toast.success("Aluno editado com sucesso!");
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
      title="Dados pessoais"
      description={
        anonymized
          ? "Aluno anonimizado. O histórico foi preservado e os dados pessoais foram removidos."
          : "Informações base para identificar o aluno e iniciar o acesso."
      }
      loading={isLoading}
      actions={
        <>
          <Button
            onClick={() => navigate({ to: "/students" })}
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
      {anonymized && (
        <div className={styles.anonymizedNotice}>
          <strong>Anonimizado</strong>
          <span>
            Nome, contato e endereço podem aparecer mascarados conforme o
            retorno da API.
          </span>
        </div>
      )}

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
      </div>

      <div className={styles.row}>
        <TextField
          label="CPF"
          id="cpf"
          value={data.cpf}
          onChange={setMasked("cpf", "###.###.###-##")}
          placeholder="000.000.000-00"
          disabled
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
      </fieldset>
    </Form>
  );
};
