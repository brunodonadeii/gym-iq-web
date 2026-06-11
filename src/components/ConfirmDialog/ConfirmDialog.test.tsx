import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "./ConfirmDialog";

const renderDialog = ({
  loading = false,
  onCancel = vi.fn(),
  onConfirm = vi.fn(),
}: {
  loading?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
} = {}) => {
  render(
    <ConfirmDialog
      open
      title="Excluir registro?"
      description="Esta ação não pode ser desfeita."
      loading={loading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />,
  );

  return { onCancel, onConfirm };
};

describe("ConfirmDialog", () => {
  it("focuses the cancel action when opened", async () => {
    renderDialog();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
    });
  });

  it("closes with Escape when not loading", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderDialog();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
    });
    await user.keyboard("{Escape}");

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("does not close with Escape while loading", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderDialog({ loading: true });

    screen.getByRole("dialog").focus();
    await user.keyboard("{Escape}");

    expect(onCancel).not.toHaveBeenCalled();
  });

  it("keeps Tab navigation inside the dialog", async () => {
    const user = userEvent.setup();
    renderDialog();

    const closeButton = screen.getByRole("button", { name: "Fechar" });
    const cancelButton = screen.getByRole("button", { name: "Cancelar" });
    const confirmButton = screen.getByRole("button", { name: "Confirmar" });

    await waitFor(() => {
      expect(cancelButton).toHaveFocus();
    });

    confirmButton.focus();
    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(confirmButton).toHaveFocus();
  });

  it("returns focus to the element that opened the dialog", async () => {
    const user = userEvent.setup();

    const DialogHarness = () => {
      const [open, setOpen] = useState(false);

      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Abrir modal
          </button>
          <ConfirmDialog
            open={open}
            title="Excluir registro?"
            description="Esta ação não pode ser desfeita."
            onCancel={() => setOpen(false)}
            onConfirm={vi.fn()}
          />
        </>
      );
    };

    render(<DialogHarness />);

    const opener = screen.getByRole("button", { name: "Abrir modal" });
    await user.click(opener);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
    });
    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(opener).toHaveFocus();
    });
  });
});
