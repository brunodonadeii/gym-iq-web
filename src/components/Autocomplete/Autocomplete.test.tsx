import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Autocomplete, type AutocompleteOption } from "./Autocomplete";

const options: AutocompleteOption[] = [
  { label: "João Silva", value: "1", description: "joao@example.com" },
  { label: "Maria Souza", value: "2", description: "maria@example.com" },
  { label: "Ana Lima", value: "3" },
];

const renderAutocomplete = ({
  search = "",
  onSearchChange = vi.fn(),
  onSelect = vi.fn(),
  onClear = vi.fn(),
}: {
  search?: string;
  onSearchChange?: (value: string) => void;
  onSelect?: (option: AutocompleteOption) => void;
  onClear?: () => void;
} = {}) => {
  render(
    <Autocomplete
      id="student"
      label="Aluno"
      search={search}
      options={options}
      onSearchChange={onSearchChange}
      onSelect={onSelect}
      onClear={onClear}
    />,
  );

  return { onSearchChange, onSelect, onClear };
};

describe("Autocomplete", () => {
  it("exposes combobox and listbox semantics", async () => {
    const user = userEvent.setup();
    renderAutocomplete();

    const combobox = screen.getByRole("combobox", { name: "Aluno" });
    await user.click(combobox);

    expect(combobox).toHaveAttribute("aria-expanded", "true");
    expect(combobox).toHaveAttribute("aria-autocomplete", "list");
    expect(combobox).toHaveAttribute("aria-controls");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("selects an option with ArrowDown and Enter", async () => {
    const user = userEvent.setup();
    const { onSelect } = renderAutocomplete();
    const combobox = screen.getByRole("combobox", { name: "Aluno" });

    await user.click(combobox);
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");

    expect(onSelect).toHaveBeenCalledWith(options[1]);
    await waitFor(() => {
      expect(combobox).toHaveAttribute("aria-expanded", "false");
    });
  });

  it("wraps active option navigation with ArrowUp", async () => {
    const user = userEvent.setup();
    const { onSelect } = renderAutocomplete();
    const combobox = screen.getByRole("combobox", { name: "Aluno" });

    await user.click(combobox);
    await user.keyboard("{ArrowUp}{Enter}");

    expect(onSelect).toHaveBeenCalledWith(options[2]);
  });

  it("closes the listbox with Escape", async () => {
    const user = userEvent.setup();
    renderAutocomplete();
    const combobox = screen.getByRole("combobox", { name: "Aluno" });

    await user.click(combobox);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("clears the selection with the clear button", async () => {
    const user = userEvent.setup();
    const { onClear } = renderAutocomplete({ search: "João" });

    await user.click(screen.getByRole("button", { name: "Limpar seleção" }));

    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
