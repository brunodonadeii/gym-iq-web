import { Button } from "@/components/Button/Button";
import { Form } from "@/components/Form/Form";
import { TextField } from "@/components/TextField/TextField";
import { useFormInputs } from "@/hooks/useFormInputs";
import { useUpdateStudent } from "@/mutations/useUpdateStudent";
import { useGetStudentById } from "@/queries/useGetStudentById";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { isAnonymizedStudent, type StudentUpdateFormData } from "../types";
import styles from "./StudentsEdit.module.css";

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
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const { set, setMasked } = useFormInputs(setData);
  const { mutate: mutateUpdate, isPending } = useUpdateStudent();
  const { data: details, isLoading } = useGetStudentById(studentId);
  const navigate = useNavigate();
  const anonymized = isAnonymizedStudent(details);

  useEffect(() => {
    if (!details) return;

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
  }, [details]);

  const focusFirstError = (nextErrors: Partial<Record<string, string>>) => {
    const firstField = Object.keys(nextErrors)[0];
    if (!firstField) return;

    document.getElementById(firstField)?.focus();
  };

  const validate = () => {
    const nextErrors: Partial<Record<string, string>> = {};

    if (!data.name.trim()) nextErrors.name = "Informe o nome.";
    if (!data.email.trim()) nextErrors.email = "Informe o e-mail.";
    if (!data.birthDate) nextErrors.birthDate = "Informe a data de nascimento.";
    if (!data.phone.trim()) nextErrors.phone = "Informe o telefone.";

    setErrors(nextErrors);
    return nextErrors;
  };

  const handleSubmit = () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      focusFirstError(nextErrors);
      return;
    }

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
          />
        </div>

        <div className={styles.row}>
          <TextField
            label="Endereço completo"
            id="address"
            value={data.address}
            onChange={set("address")}
            placeholder="Rua, numero, bairro, cidade - UF"
          />
        </div>
      </fieldset>
    </Form>
  );
};
