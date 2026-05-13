import styles from "./StudentForm.module.css";
import { Skeleton } from "@/components/Skeleton/Skeleton";
import type { ReactNode } from "react";

type StudentFormProps = {
  children: ReactNode;
  actions: ReactNode;
  loading?: boolean;
  title: string;
  description: string;
};

export const StudentForm = ({
  children,
  actions,
  loading,
  description,
  title = "Dados pessoais",
}: StudentFormProps) => {
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
