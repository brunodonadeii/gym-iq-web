import { Button } from "@/components/Button/Button";
import { Card } from "@/components/Card/Card";
import { TextField } from "@/components/TextField/TextField";
import { forgotPassword } from "@/services/auth";
import { normalizeApiError, showApiError } from "@/utils/apiError";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import styles from "@/pages/Login/LoginPage.module.css";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await forgotPassword({ email: email.trim() });
      setSuccessMessage(response.message);
    } catch (error) {
      const apiError = normalizeApiError(
        error,
        "Nao foi possivel solicitar a redefinicao de senha.",
      );

      setErrorMessage(apiError.mensagem ?? apiError.message);
      showApiError(apiError, "Nao foi possivel solicitar a redefinicao de senha.");
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
            Recupere seu <span className={styles.accent}>acesso</span> com
            seguranca.
          </h2>
          <p className={styles.muted}>
            Informe seu e-mail para receber o link de redefinicao de senha.
          </p>
        </div>
      </div>

      <div className={styles.right}>
        <form className={styles.formWrapper} onSubmit={handleSubmit}>
          <Card>
            <div>
              <h3>Esqueci minha senha</h3>
              <span>Enviaremos um link para redefinir sua senha</span>
            </div>

            <TextField
              label="E-mail"
              type="email"
              id="forgotPasswordEmail"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
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

            <Button type="submit" loading={isSubmitting} disabled={!email.trim()}>
              Enviar link
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
