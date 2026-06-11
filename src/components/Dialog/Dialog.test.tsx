import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "./Dialog";

const DialogHarness = ({
  closeDisabled = false,
  onClose = vi.fn(),
}: {
  closeDisabled?: boolean;
  onClose?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const closeDialog = () => {
    onClose();
    setOpen(false);
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Abrir
      </button>
      <Dialog
        open={open}
        labelledBy="dialog-title"
        closeDisabled={closeDisabled}
        initialFocusRef={cancelButtonRef}
        onClose={closeDialog}
      >
        <h2 id="dialog-title">Título do diálogo</h2>
        <button type="button">Primeira ação</button>
        <button ref={cancelButtonRef} type="button" onClick={closeDialog}>
          Cancelar
        </button>
      </Dialog>
    </>
  );
};

describe("Dialog", () => {
  it("moves focus into the dialog and restores it after closing", async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);

    const opener = screen.getByRole("button", { name: "Abrir" });
    await user.click(opener);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
    });

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(opener).toHaveFocus();
    });
  });

  it("keeps Tab navigation inside the dialog", async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);

    await user.click(screen.getByRole("button", { name: "Abrir" }));

    const firstAction = screen.getByRole("button", {
      name: "Primeira ação",
    });
    const cancelButton = screen.getByRole("button", { name: "Cancelar" });

    await waitFor(() => {
      expect(cancelButton).toHaveFocus();
    });

    await user.tab();
    expect(firstAction).toHaveFocus();

    await user.tab({ shift: true });
    expect(cancelButton).toHaveFocus();
  });

  it("closes when the overlay is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<DialogHarness onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Abrir" }));
    await user.click(screen.getByRole("dialog").parentElement!);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("blocks Escape and overlay closing while disabled", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<DialogHarness closeDisabled onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Abrir" }));
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("dialog").parentElement!);

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
