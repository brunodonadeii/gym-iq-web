import { Button } from "@/components/Button/Button";
import { Card } from "@/components/Card/Card";
import { TextField } from "@/components/TextField/TextField";
import { resetPassword } from "@/services/auth";
import { normalizeApiError, showApiError } from "@/utils/apiError";
import { Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import styles from "@/pages/Login/LoginPage.module.css";

export const ResetPasswordPage = () => {
  const search = useSearch({ strict: false }) as { token?: string };
  const token = search.token ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (!token) {
      return "O link de redefinicao esta incompleto ou invalido.";
    }

    if (newPassword.length < 6) {
      return "Use pelo menos 6 caracteres na nova senha.";
    }

    if (newPassword !== confirmPassword) {
      return "As senhas nao coincidem.";
    }

    return "";
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const validationError = validate();
    setErrorMessage(validationError);
    setSuccessMessage("");

    if (validationError) {
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
      const apiError = normalizeApiError(
        error,
        "Nao foi possivel redefinir a senha.",
      );

      setErrorMessage(apiError.mensagem ?? apiError.message);
      showApiError(apiError, "Nao foi possivel redefinir a senha.");
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
        <form className={styles.formWrapper} onSubmit={handleSubmit}>
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
                setErrorMessage("");
              }}
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
                setErrorMessage("");
              }}
              error={errorMessage || undefined}
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
