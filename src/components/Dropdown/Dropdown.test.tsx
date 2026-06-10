import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pencil } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { Dropdown } from "./Dropdown";

describe("Dropdown", () => {
  it("opens using the default accessible trigger", async () => {
    const user = userEvent.setup();

    render(
      <Dropdown
        items={[
          { label: "Editar" },
          { label: "Excluir" },
        ]}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Ações" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menuitem", { name: "Editar" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Excluir" })).toBeInTheDocument();
  });

  it("calls the selected item action and closes the menu", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<Dropdown items={[{ label: "Editar", onSelect }]} />);

    await user.click(screen.getByRole("button", { name: "Ações" }));
    await user.click(screen.getByRole("menuitem", { name: "Editar" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menuitem", { name: "Editar" })).not.toBeInTheDocument();
  });

  it("does not select disabled items", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <Dropdown
        items={[
          {
            label: "Excluir",
            disabled: true,
            onSelect,
          },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Ações" }));

    const item = screen.getByRole("menuitem", { name: "Excluir" });
    expect(item).toHaveAttribute("data-disabled");
    await user.click(item);

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("renders item metadata and a custom trigger", async () => {
    const user = userEvent.setup();

    render(
      <Dropdown
        trigger={<button type="button">Abrir opções</button>}
        items={[
          {
            label: "Editar",
            icon: <Pencil data-testid="edit-icon" />,
            tooltip: "Editar cadastro",
          },
        ]}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Abrir opções" }),
    );

    const item = screen.getByRole("menuitem", { name: "Editar" });
    expect(item).toHaveAttribute("title", "Editar cadastro");
    expect(screen.getByTestId("edit-icon")).toBeInTheDocument();
  });
});
