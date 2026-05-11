import { login } from "@/services/auth";
import { useState } from "react";
import styles from "./LoginPage.module.css";
import { Card } from "@/components/Card/Card";
import { Button } from "@/components/Button/Button";
import { TextField } from "@/components/TextField/TextField";
import { FormHeader } from "./components/FormHeader/FormHeader";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.innerLeft}>
          <div className={styles.logoContainer}>
            <img className={styles.logo} src="/logo.svg" alt="Gym IQ" />
          </div>
          <h2>
            Dados, <span className={styles.accent}>previsoes</span> e gestao em
            um so sistema.
          </h2>
          <p className={styles.muted}>
            Centralize alunos, pagamentos, metricas e analises preditivas em
            uma unica plataforma.
          </p>
        </div>
      </div>

      <div className={styles.right}>
        <form
          className={styles.formWrapper}
          onSubmit={handleSubmit}
        >
          <Card>
            <FormHeader />
            <TextField
              label="Email"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="Senha"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button type="submit">Entrar</Button>

            <div className={styles.demoCard}>
              <p className={styles.demoTitle}>
                <strong>Conta Demo:</strong>
              </p>
              <div className={styles.demoCredentials}>
                <div className={styles.demoItem}>
                  <span>Email:</span> admin@gymiq.com
                </div>
                <div className={styles.demoItem}>
                  <span>Senha:</span> gymiq@2026
                </div>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
};
