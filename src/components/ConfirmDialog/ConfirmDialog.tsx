import { Button } from "@/components/Button/Button";
import { AlertTriangle, X } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./ConfirmDialog.module.css";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  loading = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!open) return null;

  return (
    <div className={styles.overlay} role="presentation">
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmDialogTitle"
        aria-describedby="confirmDialogDescription"
      >
        <div className={styles.header}>
          <span className={styles.icon}>
            <AlertTriangle size={20} />
          </span>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onCancel}
            disabled={loading}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.content}>
          <h2 className={styles.title} id="confirmDialogTitle">
            {title}
          </h2>
          <div className={styles.description} id="confirmDialogDescription">
            {description}
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            loading={loading}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
};
