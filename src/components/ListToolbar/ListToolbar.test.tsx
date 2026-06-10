import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ListToolbar } from "./ListToolbar";

describe("ListToolbar", () => {
  it("renders search, filters and action content", () => {
    render(
      <ListToolbar
        search={<input aria-label="Buscar" />}
        filters={<button type="button">Filtrar ativos</button>}
        action={<button type="button">Novo aluno</button>}
      />,
    );

    expect(screen.getByRole("textbox", { name: "Buscar" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Filtrar ativos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Novo aluno" }),
    ).toBeInTheDocument();
  });

  it("supports partial composition without rendering unwanted content", () => {
    render(
      <ListToolbar action={<button type="button">Adicionar</button>} />,
    );

    expect(
      screen.getByRole("button", { name: "Adicionar" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
