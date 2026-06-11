import { Skeleton } from "@/components/Skeleton/Skeleton";
import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import { formatDateTime, getErrorMessage } from "../utils";
import styles from "../DashboardPage.module.css";

type DashboardSectionProps = {
  title: string;
  description: string;
  generatedAt?: string;
  loading?: boolean;
  error?: unknown;
  action?: ReactNode;
  children: ReactNode;
};

export const DashboardSection = ({
  title,
  description,
  generatedAt,
  loading,
  error,
  action,
  children,
}: DashboardSectionProps) => (
  <section className={styles.section}>
    <div className={styles.sectionHeader}>
      <div>
        <h3 className={styles.sectionTitle}>{title}</h3>
        <p className={styles.sectionDescription}>{description}</p>
      </div>
      <div className={styles.sectionMeta}>
        {action}
        <div className={styles.generatedAt}>
          {loading ? (
            <Skeleton width="160px" height="16px" />
          ) : (
            `Gerado em ${formatDateTime(generatedAt)}`
          )}
        </div>
      </div>
    </div>

    {error ? (
      <div className={styles.errorState}>
        <AlertTriangle size={18} />
        <div>
          <strong>Não foi possível carregar este bloco.</strong>
          <span>
            {getErrorMessage(
              error,
              "Tente atualizar a página ou verificar sua conexão.",
            )}
          </span>
        </div>
      </div>
    ) : (
      children
    )}
  </section>
);


