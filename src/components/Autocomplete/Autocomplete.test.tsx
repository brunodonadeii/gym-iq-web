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
  onLoadMore = vi.fn(),
  hasMoreOptions = false,
  loadingMore = false,
}: {
  search?: string;
  onSearchChange?: (value: string) => void;
  onSelect?: (option: AutocompleteOption) => void;
  onClear?: () => void;
  onLoadMore?: () => void;
  hasMoreOptions?: boolean;
  loadingMore?: boolean;
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
      onLoadMore={onLoadMore}
      hasMoreOptions={hasMoreOptions}
      loadingMore={loadingMore}
    />,
  );

  return { onSearchChange, onSelect, onClear, onLoadMore };
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

  it("requests more options when the list is scrolled to the end", async () => {
    const user = userEvent.setup();
    const { onLoadMore } = renderAutocomplete({ hasMoreOptions: true });

    await user.click(screen.getByRole("combobox", { name: "Aluno" }));

    const listbox = screen.getByRole("listbox");

    Object.defineProperty(listbox, "scrollHeight", {
      value: 400,
      configurable: true,
    });
    Object.defineProperty(listbox, "clientHeight", {
      value: 200,
      configurable: true,
    });

    listbox.scrollTop = 180;
    listbox.dispatchEvent(new Event("scroll"));

    expect(onLoadMore).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Role para ver mais")).toBeInTheDocument();
  });
});
