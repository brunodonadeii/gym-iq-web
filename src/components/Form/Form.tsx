import { Skeleton } from "@/components/Skeleton/Skeleton";
import type { ReactNode } from "react";
import styles from "./Form.module.css";

type FormProps = {
  children: ReactNode;
  actions: ReactNode;
  loading?: boolean;
  title: string;
  description: string;
};

export const Form = ({
  children,
  actions,
  loading,
  description,
  title = "Dados pessoais",
}: FormProps) => {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {loading ? (
          <div className={styles.skeletonStack}>
            <Skeleton width="180px" height="18px" />
            <Skeleton width="min(520px, 100%)" height="16px" />
            <Skeleton height="56px" />
            <div className={styles.skeletonRow}>
              <Skeleton height="56px" />
              <Skeleton height="56px" />
            </div>
            <div className={styles.skeletonRow}>
              <Skeleton height="56px" />
              <Skeleton height="56px" />
            </div>
          </div>
        ) : (
          <>
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>{title}</legend>
              <p className={styles.sectionText}>{description}</p>
            </fieldset>
            {children}
          </>
        )}
      </div>

      <div className={styles.actions}>{actions}</div>
    </div>
  );
};
