import { Button } from "@/components/Button/Button";
import { Card } from "@/components/Card/Card";
import { TextField } from "@/components/TextField/TextField";
import { resetPassword } from "@/services/auth";
import {
  getApiFieldErrors,
  normalizeApiError,
  showApiError,
} from "@/utils/apiError";
import { Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import styles from "@/pages/Login/LoginPage.module.css";

export const ResetPasswordPage = () => {
  const search = useSearch({ strict: false }) as { token?: string };
  const token = search.token ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    let hasError = false;

    if (!token) {
      showApiError(
        new Error("O link de redefinição está incompleto ou inválido."),
        "O link de redefinição está incompleto ou inválido.",
      );
      hasError = true;
    }

    if (newPassword.length < 6) {
      setPasswordError("Use pelo menos 6 caracteres na nova senha.");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("As senhas não coincidem.");
      hasError = true;
    } else {
      setConfirmPasswordError("");
    }

    return hasError;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const hasValidationError = validate();
    setSuccessMessage("");

    if (hasValidationError) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resetPassword({
        token,
        newPassword,
      });
      setSuccessMessage(response.message);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error, [
        "newPassword",
        "password",
        "confirmPassword",
      ] as const);

      if (fieldErrors) {
        setPasswordError(
          fieldErrors.newPassword ?? fieldErrors.password ?? "",
        );
        setConfirmPasswordError(fieldErrors.confirmPassword ?? "");
        return;
      }

      const apiError = normalizeApiError(
        error,
            "Não foi possível redefinir a senha.",
      );
          showApiError(apiError, "Não foi possível redefinir a senha.");
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
            Defina sua <span className={styles.accent}>nova senha</span>.
          </h2>
          <p className={styles.muted}>
            Escolha uma senha nova para voltar a acessar sua conta.
          </p>
        </div>
      </div>

      <div className={styles.right}>
        <form className={styles.formWrapper} onSubmit={handleSubmit} noValidate>
          <Card>
            <div>
              <h3>Redefinir senha</h3>
              <span>Use o token recebido no seu e-mail</span>
            </div>

            <TextField
              label="Nova senha"
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordError("");
              }}
              error={passwordError || undefined}
              disabled={isSubmitting}
              required
            />

            <TextField
              label="Confirmar nova senha"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmPasswordError("");
              }}
              error={confirmPasswordError || undefined}
              disabled={isSubmitting}
              required
            />

            {successMessage && (
              <div className={styles.successMessage} role="status">
                {successMessage}
              </div>
            )}

            <Button
              type="submit"
              loading={isSubmitting}
              disabled={!newPassword || !confirmPassword}
            >
              Salvar nova senha
            </Button>

            <div className={styles.footerAction}>
              <Link className={styles.inlineLink} to="/login">
                Voltar para login
              </Link>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
};


