import { Button } from "@/components/Button/Button";
import { Dialog } from "@/components/Dialog/Dialog";
import { AlertTriangle, X } from "lucide-react";
import type { ReactNode } from "react";
import { useId, useRef } from "react";
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
  const titleId = useId();
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog
      open={open}
      className={styles.dialog}
      labelledBy={titleId}
      describedBy={descriptionId}
      closeDisabled={loading}
      initialFocusRef={cancelButtonRef}
      onClose={onCancel}
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
        <h2 className={styles.title} id={titleId}>
          {title}
        </h2>
        <div className={styles.description} id={descriptionId}>
          {description}
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          ref={cancelButtonRef}
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
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
    </Dialog>
  );
};
