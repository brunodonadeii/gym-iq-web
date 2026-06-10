import { Button } from "@/components/Button/Button";
import { Card } from "@/components/Card/Card";
import { TextField } from "@/components/TextField/TextField";
import { router } from "@/router";
import { login } from "@/services/auth";
import {
  getApiFieldErrors,
  normalizeApiError,
  showApiError,
} from "@/utils/apiError";
import { auth, getDefaultPathByRole } from "@/utils/auth";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { FormHeader } from "./components/FormHeader/FormHeader";
import styles from "./LoginPage.module.css";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const search = useSearch({ strict: false }) as {
    redirect?: string;
    reason?: "session-expired" | "permissions-changed";
  };
  const redirect = search.redirect ?? "/dashboard";
  const navigate = useNavigate();
  const canSubmit = Boolean(email.trim() && password);

  const validate = () => {
    let hasError = false;

    if (!email.trim()) {
      setEmailError("Informe seu e-mail.");
      hasError = true;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Informe sua senha.");
      hasError = true;
    } else {
      setPasswordError("");
    }

    return hasError;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (validate()) return;

    setIsSubmitting(true);

    try {
      await login({ email, password });
      await router.invalidate();
      navigate({
        to:
          redirect === "/dashboard" ? getDefaultPathByRole(auth.role) : redirect,
      });
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error, ["email", "password"] as const);
      if (fieldErrors) {
        setEmailError(fieldErrors.email ?? "");
        setPasswordError(fieldErrors.password ?? "");
        return;
      }

      const apiError = normalizeApiError(
        error,
            "Não foi possível entrar. Confira seu e-mail e senha e tente novamente.",
      );

      showApiError(
        apiError,
            "Não foi possível entrar. Confira seu e-mail e senha e tente novamente.",
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
            Dados, <span className={styles.accent}>previsões</span> e gestão em
            um só sistema.
          </h2>
          <p className={styles.muted}>
            Centralize alunos, pagamentos, métricas e análises preditivas em uma
            única plataforma.
          </p>
        </div>
      </div>

      <div className={styles.right}>
        <form className={styles.formWrapper} onSubmit={handleSubmit} noValidate>
          <Card>
            <FormHeader />
            {search.reason === "permissions-changed" && (
              <div className={styles.warningMessage} role="alert">
                Suas permissões foram alteradas. Entre novamente para atualizar
                seu acesso.
              </div>
            )}
            {search.reason === "session-expired" && (
              <div className={styles.warningMessage} role="alert">
                Sua sessão expirou. Entre novamente para continuar.
              </div>
            )}
            <TextField
              label="E-mail"
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              error={emailError || undefined}
              disabled={isSubmitting}
            />

            <TextField
              label="Senha"
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              error={passwordError || undefined}
              disabled={isSubmitting}
            />

            <Button type="submit" loading={isSubmitting} disabled={!canSubmit}>
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


