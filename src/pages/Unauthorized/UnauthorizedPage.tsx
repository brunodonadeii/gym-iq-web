import { Button } from "@/components/Button/Button";
import { auth, clearAuthStorage, getDefaultPathByRole } from "@/utils/auth";
import { useNavigate } from "@tanstack/react-router";
import styles from "./UnauthorizedPage.module.css";

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (auth.hasAnyRole(["ADMIN", "RECEPTION"])) {
      navigate({ to: getDefaultPathByRole(auth.role) });
      return;
    }

    clearAuthStorage();
    navigate({ to: "/login" });
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>Acesso não permitido</h1>
        <p className={styles.description}>
          Seu usuário não tem permissão para acessar esta área do sistema.
        </p>

        <div className={styles.actions}>
          <Button type="button" onClick={handleBack}>
            Voltar
          </Button>
        </div>
      </section>
    </main>
  );
};
