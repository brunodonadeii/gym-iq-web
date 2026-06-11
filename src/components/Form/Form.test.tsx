import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Form } from "./Form";

describe("Form", () => {
  it("renders title, description, children and actions", () => {
    render(
      <Form
        title="Dados pessoais"
        description="Atualize os dados do aluno."
        actions={<button type="button">Cancelar</button>}
      >
        <input aria-label="Nome" />
      </Form>,
    );

    expect(screen.getByText("Dados pessoais")).toBeInTheDocument();
    expect(
      screen.getByText("Atualize os dados do aluno."),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Nome" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cancelar" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
  });

  it("submits through a semantic form and prevents native navigation", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <Form
        title="Cadastro"
        description="Preencha os campos."
        actions={<button type="submit">Salvar</button>}
        onSubmit={onSubmit}
      >
        <input aria-label="Nome" />
      </Form>,
    );

    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(document.querySelector("form")).toHaveAttribute("novalidate");
  });

  it("shows skeletons and hides form content while loading", () => {
    render(
      <Form
        title="Cadastro"
        description="Preencha os campos."
        actions={<button type="button">Voltar</button>}
        loading
      >
        <input aria-label="Nome" />
      </Form>,
    );

    expect(screen.queryByText("Cadastro")).not.toBeInTheDocument();
    expect(screen.queryByText("Preencha os campos.")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Nome" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Voltar" })).toBeInTheDocument();
    expect(document.querySelectorAll('[aria-hidden="true"]')).toHaveLength(7);
  });

  it("does not call onSubmit while loading", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <Form
        title="Cadastro"
        description="Preencha os campos."
        actions={<button type="submit">Salvar</button>}
        loading
        onSubmit={onSubmit}
      >
        <input aria-label="Nome" />
      </Form>,
    );

    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
