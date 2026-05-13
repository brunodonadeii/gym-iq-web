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
          <Skeleton height={"1000px"} />
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
