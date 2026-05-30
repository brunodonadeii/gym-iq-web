import { Button } from "@/components/Button/Button";
import { Card } from "@/components/Card/Card";
import { TextField } from "@/components/TextField/TextField";
import { router } from "@/router";
import { login } from "@/services/auth";
import { normalizeApiError, showApiError } from "@/utils/apiError";
import { auth, getDefaultPathByRole } from "@/utils/auth";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { FormHeader } from "./components/FormHeader/FormHeader";
import styles from "./LoginPage.module.css";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const search = useSearch({ strict: false }) as { redirect?: string };
  const redirect = search.redirect ?? "/dashboard";
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
      await router.invalidate();
      navigate({
        to:
          redirect === "/dashboard" ? getDefaultPathByRole(auth.role) : redirect,
      });
    } catch (error) {
      const apiError = normalizeApiError(
        error,
        "Nao foi possivel entrar. Confira seu e-mail e senha e tente novamente.",
      );

      setErrorMessage(apiError.mensagem ?? apiError.message);
      showApiError(
        apiError,
        "Nao foi possivel entrar. Confira seu e-mail e senha e tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
            Centralize alunos, pagamentos, metricas e analises preditivas em uma
            unica plataforma.
          </p>
        </div>
      </div>

      <div className={styles.right}>
        <form className={styles.formWrapper} onSubmit={handleSubmit}>
          <Card>
            <FormHeader />
            <TextField
              label="E-mail"
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage("");
              }}
              disabled={isSubmitting}
            />

            <TextField
              label="Senha"
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage("");
              }}
              disabled={isSubmitting}
            />

            {errorMessage && (
              <div className={styles.errorMessage} role="alert">
                {errorMessage}
              </div>
            )}

            <Button type="submit" loading={isSubmitting}>
              Entrar
            </Button>

            <div className={styles.footerAction}>
              <Link className={styles.inlineLink} to="/forgot-password">
                Esqueci minha senha
              </Link>
            </div>

            <div className={styles.demoCard}>
              <p className={styles.demoTitle}>
                <strong>Conta Demo:</strong>
              </p>
              <div className={styles.demoCredentials}>
                <div className={styles.demoItem}>
                  <span>E-mail:</span> admin@gymiq.com
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
