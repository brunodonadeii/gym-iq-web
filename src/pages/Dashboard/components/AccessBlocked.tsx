import { ShieldAlert } from "lucide-react";
import styles from "../DashboardPage.module.css";

export const AccessBlocked = () => (
  <section className={styles.blockedState}>
    <ShieldAlert size={28} />
    <div>
      <h2>Dashboard disponível apenas para administradores</h2>
      <p>
        Sua sessão não tem permissão para acessar os indicadores
        administrativos.
      </p>
    </div>
  </section>
);


