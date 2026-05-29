import { Button } from "@/components/Button/Button";
import { Link } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import styles from "./RouteFallback.module.css";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;

  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message);
  }

  return "Ocorreu um erro inesperado ao carregar esta tela.";
};

export const GlobalErrorFallback = ({ error }: ErrorComponentProps) => {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span className={styles.eyebrow}>Erro</span>
        <h1 className={styles.title}>Não foi possível carregar a página</h1>
        <p className={styles.description}>{getErrorMessage(error)}</p>

        <div className={styles.actions}>
          <Button type="button" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
          <Link to="/dashboard" className={styles.link}>
            Voltar para o dashboard
          </Link>
        </div>
      </section>
    </main>
  );
};

export const GlobalNotFoundFallback = () => {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span className={styles.eyebrow}>404</span>
        <h1 className={styles.title}>Página não encontrada</h1>
        <p className={styles.description}>
          O endereço acessado não existe ou foi removido.
        </p>

        <div className={styles.actions}>
          <Link to="/dashboard" className={styles.link}>
            Voltar para o dashboard
          </Link>
        </div>
      </section>
    </main>
  );
};
