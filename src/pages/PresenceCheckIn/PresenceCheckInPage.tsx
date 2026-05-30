import { Button } from "@/components/Button/Button";
import { TextField } from "@/components/TextField/TextField";
import { useSelfCheckIn } from "@/mutations/useSelfCheckIn";
import type {
  PresenceCheckInResponse,
  SelfCheckInFormData,
} from "@/pages/PresenceCheckIn/types";
import { normalizeApiError } from "@/utils/apiError";
import { AlertCircle, CheckCircle2, LogIn, RotateCcw } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import styles from "./PresenceCheckInPage.module.css";

const EMPTY_FORM: SelfCheckInFormData = {
  identifier: "",
  password: "",
};

const formatDateTime = (value?: string) =>
  value
    ? new Date(value).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

export const PresenceCheckInPage = () => {
  const [data, setData] = useState<SelfCheckInFormData>(EMPTY_FORM);
  const [presence, setPresence] = useState<PresenceCheckInResponse | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState("");
  const { mutate, isPending } = useSelfCheckIn();
  const canSubmit = Boolean(data.identifier.trim() && data.password.trim());

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setPresence(null);

    mutate(
      {
        identifier: data.identifier.trim(),
        password: data.password,
        notes: "Check-in pelo totem",
      },
      {
        onSuccess: (response) => {
          setPresence(response);
          setData(EMPTY_FORM);
        },
        onError: (error) => {
          const apiError = normalizeApiError(
            error,
            "Nao foi possivel registrar o check-in.",
          );
          setErrorMessage(apiError.mensagem ?? apiError.message);
        },
      },
    );
  };

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <img className={styles.logo} src="/logo.svg" alt="Gym IQ" />
            <h1 className={styles.panelTitle}>Check-in</h1>
            <p className={styles.panelText}>
              Informe CPF ou e-mail e senha para registrar sua entrada.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <TextField
              label="CPF ou e-mail"
              id="identifier"
              value={data.identifier}
              onChange={(event) =>
                setData((prev) => ({
                  ...prev,
                  identifier: event.target.value,
                }))
              }
              autoComplete="username"
              inputMode="email"
              disabled={isPending}
              autoFocus
              required
            />

            <TextField
              label="Senha"
              id="password"
              type="password"
              value={data.password}
              onChange={(event) =>
                setData((prev) => ({
                  ...prev,
                  password: event.target.value,
                }))
              }
              autoComplete="current-password"
              disabled={isPending}
              required
            />

            <div className={styles.actions}>
              <Button
                type="submit"
                leftIcon={<LogIn size={18} />}
                loading={isPending}
                disabled={!canSubmit}
              >
                Entrar na academia
              </Button>
            </div>
          </form>

          {presence && (
            <div className={`${styles.status} ${styles.statusSuccess}`}>
              <strong className={styles.statusTitle}>
                <CheckCircle2 size={30} />
                Entrada registrada
              </strong>
              <p className={styles.statusText}>
                {presence.studentName} entrou as {formatDateTime(presence.checkInAt)}.
              </p>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setPresence(null)}
              >
                <RotateCcw size={18} />
                Novo check-in
              </button>
            </div>
          )}

          {errorMessage && (
            <div className={`${styles.status} ${styles.statusError}`}>
              <strong className={styles.statusTitle}>
                <AlertCircle size={28} />
                Check-in nao registrado
              </strong>
              <p className={styles.statusText}>{errorMessage}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};
