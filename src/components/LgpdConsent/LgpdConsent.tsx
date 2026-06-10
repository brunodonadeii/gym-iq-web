import { Button } from "@/components/Button/Button";
import { ShieldCheck, X } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./LgpdConsent.module.css";

type LgpdConsentProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  id?: string;
};

export const LgpdConsent = ({
  checked,
  onChange,
  error,
  id = "lgpdAccepted",
}: LgpdConsentProps) => {
  const [policyOpen, setPolicyOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const errorId = `${id}-error`;
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const policyButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!policyOpen) return undefined;

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      policyButtonRef.current?.focus();
    };
  }, [policyOpen]);

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setPolicyOpen(false);
      return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = dialogRef.current
      ? Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            "button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])",
          ),
        )
      : [];

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <>
      <div
        className={`${styles.consentBox} ${error ? styles.consentBoxError : ""}`}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          required
        />
        <div className={styles.consentText}>
          <label htmlFor={id}>Li e estou ciente da </label>
          <button
            ref={policyButtonRef}
            type="button"
            className={styles.policyLink}
            onClick={() => setPolicyOpen(true)}
          >
            Política de Privacidade
          </button>
          <label htmlFor={id}>
            {" "}
            e do tratamento dos meus dados pessoais.
            <span className={styles.requiredMark} aria-hidden="true">
              {" *"}
            </span>
          </label>
        </div>
      </div>

      {error && (
        <div className={styles.error} id={errorId}>
          {error}
        </div>
      )}

      {policyOpen && (
        <div
          className={styles.overlay}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPolicyOpen(false);
            }
          }}
        >
          <section
            ref={dialogRef}
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            onKeyDown={handleDialogKeyDown}
          >
            <div className={styles.header}>
              <span className={styles.icon} aria-hidden="true">
                <ShieldCheck size={22} />
              </span>
              <button
                ref={closeButtonRef}
                type="button"
                className={styles.closeButton}
                onClick={() => setPolicyOpen(false)}
                aria-label="Fechar Política de Privacidade"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.content}>
              <h2 className={styles.title} id={titleId}>
                Política de Privacidade
              </h2>
              <div className={styles.policyContent} id={descriptionId}>
                <p>
                  Esta política explica como os dados pessoais são utilizados no
                  sistema GymIQ para viabilizar o cadastro e a operação da
                  academia.
                </p>

                <h3>Dados tratados</h3>
                <p>
                  Podemos tratar dados de identificação, contato, endereço,
                  matrícula, pagamentos, presença e informações necessárias à
                  prestação dos serviços contratados.
                </p>

                <h3>Finalidades</h3>
                <p>
                  Os dados são utilizados para gerenciamento de acesso,
                  matrículas, cobranças, fichas de treino, comunicação
                  operacional, segurança e cumprimento de obrigações legais.
                </p>

                <h3>Compartilhamento e segurança</h3>
                <p>
                  O acesso é limitado a pessoas autorizadas e fornecedores
                  necessários à operação. São adotadas medidas técnicas e
                  administrativas para reduzir riscos de acesso, alteração ou
                  divulgação indevida.
                </p>

                <h3>Retenção e direitos</h3>
                <p>
                  Os dados são mantidos pelo período necessário às finalidades
                  informadas e às obrigações legais. O titular pode solicitar
                  confirmação, acesso, correção, informação sobre
                  compartilhamento e, quando aplicável, anonimização ou
                  eliminação dos dados.
                </p>
              </div>
            </div>

            <div className={styles.actions}>
              <Button onClick={() => setPolicyOpen(false)}>Entendi</Button>
            </div>
          </section>
        </div>
      )}
    </>
  );
};
