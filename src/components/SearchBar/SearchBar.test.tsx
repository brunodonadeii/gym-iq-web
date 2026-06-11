import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Search } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { SearchBar } from "./SearchBar";

describe("SearchBar", () => {
  it("renders a text input and forwards native attributes", () => {
    render(
      <SearchBar
        aria-label="Buscar alunos"
        placeholder="Digite um nome"
        name="studentSearch"
      />,
    );

    const input = screen.getByRole("textbox", { name: "Buscar alunos" });

    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("placeholder", "Digite um nome");
    expect(input).toHaveAttribute("name", "studentSearch");
  });

  it("allows typing and calls onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<SearchBar aria-label="Buscar" onChange={onChange} />);

    const input = screen.getByRole("textbox", { name: "Buscar" });
    await user.type(input, "Maria");

    expect(input).toHaveValue("Maria");
    expect(onChange).toHaveBeenCalledTimes(5);
  });

  it("renders the optional icon", () => {
    render(
      <SearchBar
        aria-label="Buscar"
        icon={<Search data-testid="search-icon" />}
      />,
    );

    expect(screen.getByTestId("search-icon")).toBeInTheDocument();
  });

  it("applies the custom container class", () => {
    const { container } = render(
      <SearchBar aria-label="Buscar" containerClassName="toolbar-search" />,
    );

    expect(container.firstElementChild).toHaveClass("toolbar-search");
  });

  it("respects disabled state", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SearchBar aria-label="Buscar" disabled onChange={onChange} />,
    );

    const input = screen.getByRole("textbox", { name: "Buscar" });
    await user.type(input, "teste");

    expect(input).toBeDisabled();
    expect(input).toHaveValue("");
    expect(onChange).not.toHaveBeenCalled();
  });
});
