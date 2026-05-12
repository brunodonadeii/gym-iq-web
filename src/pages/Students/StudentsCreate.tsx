import { Button } from "@/components/Button/Button";
import { TextField } from "@/components/TextField/TextField";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import styles from "./StudentsCreate.module.css";

type StudentFormData = {
  name: string;
  email: string;
  password: string;
  cpf: string;
  birthDate: string;
  phone: string;
  zipCode: string;
  address: string;
};

const EMPTY_FORM: StudentFormData = {
  name: "",
  email: "",
  password: "",
  cpf: "",
  birthDate: "",
  phone: "",
  zipCode: "",
  address: "",
};

const mask = (value: string, pattern: string) => {
  let i = 0;
  const digits = value.replace(/\D/g, "");
  return pattern.replace(/#/g, () => digits[i++] ?? "").replace(/#.*/g, "");
};

export const StudentsCreate = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<StudentFormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const set =
    (field: keyof StudentFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setData((prev) => ({ ...prev, [field]: e.target.value }));

  const setMasked =
    (field: keyof StudentFormData, pattern: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setData((prev) => ({ ...prev, [field]: mask(e.target.value, pattern) }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      navigate({ to: "/students" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Dados pessoais</legend>
          <p className={styles.sectionText}>
            Informacoes base para identificar o aluno e iniciar o acesso.
          </p>

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
        </fieldset>

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
              label="Endereco completo"
              id="address"
              value={data.address}
              onChange={set("address")}
              placeholder="Rua, numero, bairro, cidade - UF"
            />
          </div>
        </fieldset>
      </div>

      <div className={styles.actions}>
        <Button
          onClick={() => navigate({ to: "/students" })}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button onClick={handleSubmit} loading={loading}>
          Salvar
        </Button>
      </div>
    </div>
  );
};
