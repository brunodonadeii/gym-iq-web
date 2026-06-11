import type { KeyboardEvent, ReactNode, RefObject } from "react";
import { useEffect, useRef } from "react";
import styles from "./Dialog.module.css";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

type DialogProps = {
  open: boolean;
  children: ReactNode;
  labelledBy: string;
  describedBy?: string;
  className?: string;
  closeDisabled?: boolean;
  closeOnOverlay?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
};

export const Dialog = ({
  open,
  children,
  labelledBy,
  describedBy,
  className,
  closeDisabled = false,
  closeOnOverlay = true,
  initialFocusRef,
  onClose,
}: DialogProps) => {
  const dialogRef = useRef<HTMLElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;

    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const focusTimer = window.setTimeout(() => {
      const initialFocusElement = initialFocusRef?.current;

      if (initialFocusElement && !initialFocusElement.hasAttribute("disabled")) {
        initialFocusElement.focus();
        return;
      }

      const firstFocusableElement =
        dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);

      firstFocusableElement?.focus();

      if (!firstFocusableElement) {
        dialogRef.current?.focus();
      }
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      previousActiveElementRef.current?.focus();
      previousActiveElementRef.current = null;
    };
  }, [initialFocusRef, open]);

  const requestClose = () => {
    if (!closeDisabled) onClose();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      requestClose();
      return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = dialogRef.current
      ? Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        ).filter(
          (element) =>
            !element.hasAttribute("disabled") &&
            element.getAttribute("aria-hidden") !== "true",
        )
      : [];

    if (focusableElements.length === 0) {
      event.preventDefault();
      dialogRef.current?.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={(event) => {
        if (closeOnOverlay && event.target === event.currentTarget) {
          requestClose();
        }
      }}
    >
      <section
        ref={dialogRef}
        className={className}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        {children}
      </section>
    </div>
  );
};
