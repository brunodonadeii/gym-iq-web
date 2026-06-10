import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TextField } from "./TextField";

describe("TextField", () => {
  it("associates the label with the input and forwards native attributes", () => {
    render(
      <TextField
        id="email"
        label="E-mail"
        type="email"
        value=""
        placeholder="usuario@email.com"
        onChange={vi.fn()}
      />,
    );

    const input = screen.getByRole("textbox", { name: "E-mail" });

    expect(input).toHaveAttribute("id", "email");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("placeholder", "usuario@email.com");
  });

  it("calls onChange when the user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TextField
        id="name"
        label="Nome"
        value=""
        onChange={onChange}
      />,
    );

    await user.type(screen.getByRole("textbox", { name: "Nome" }), "Ana");

    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it("marks required fields without exposing the visual asterisk in the accessible name", () => {
    render(
      <TextField
        id="name"
        label="Nome"
        value=""
        onChange={vi.fn()}
        required
      />,
    );

    const input = screen.getByRole("textbox", { name: "Nome" });

    expect(input).toBeRequired();
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
  });

  it("shows optional metadata only for non-required optional fields", () => {
    const { rerender } = render(
      <TextField
        id="notes"
        label="Observações"
        value=""
        onChange={vi.fn()}
        optional
      />,
    );

    expect(screen.getByText("(opcional)")).toBeInTheDocument();

    rerender(
      <TextField
        id="notes"
        label="Observações"
        value=""
        onChange={vi.fn()}
        optional
        required
      />,
    );

    expect(screen.queryByText("(opcional)")).not.toBeInTheDocument();
  });

  it("connects helper text to the input", () => {
    render(
      <TextField
        id="password"
        label="Senha"
        type="password"
        value=""
        onChange={vi.fn()}
        helperText="Use pelo menos seis caracteres."
      />,
    );

    const input = screen.getByLabelText("Senha");
    const helper = screen.getByText("Use pelo menos seis caracteres.");

    expect(helper).toHaveAttribute("id", "password-helper");
    expect(input).toHaveAttribute("aria-describedby", "password-helper");
    expect(input).toHaveAttribute("aria-invalid", "false");
  });

  it("prioritizes the error message and marks the input as invalid", () => {
    render(
      <TextField
        id="email"
        label="E-mail"
        value="inválido"
        onChange={vi.fn()}
        helperText="Informe seu e-mail."
        error="Informe um e-mail válido."
      />,
    );

    const input = screen.getByRole("textbox", { name: "E-mail" });

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "email-helper");
    expect(screen.getByText("Informe um e-mail válido.")).toBeInTheDocument();
    expect(screen.queryByText("Informe seu e-mail.")).not.toBeInTheDocument();
  });

  it("forwards container attributes and disabled state", () => {
    render(
      <TextField
        id="cpf"
        label="CPF"
        value=""
        onChange={vi.fn()}
        disabled
        containerProps={{
          className: "document-field",
          "data-testid": "field-container",
        }}
      />,
    );

    expect(screen.getByRole("textbox", { name: "CPF" })).toBeDisabled();
    expect(screen.getByTestId("field-container")).toHaveClass(
      "document-field",
    );
  });
});
