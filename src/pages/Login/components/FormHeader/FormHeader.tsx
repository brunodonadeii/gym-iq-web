import styles from "./FormHeader.module.css";

export const FormHeader = () => {
  return (
    <div className={styles.formHeader}>
      <h3>Bem-vindo de volta</h3>
      <span>Entre para continuar sua gestão</span>
    </div>
  );
};
