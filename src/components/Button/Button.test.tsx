import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Check, ChevronRight } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders as a button with type button by default", () => {
    render(<Button>Salvar</Button>);

    const button = screen.getByRole("button", { name: "Salvar" });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("type", "button");
  });

  it("uses the provided type when supplied", () => {
    render(<Button type="submit">Enviar</Button>);

    expect(screen.getByRole("button", { name: "Enviar" })).toHaveAttribute(
      "type",
      "submit",
    );
  });

  it("calls onClick when enabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Entrar</Button>);

    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick}>
        Excluir
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Excluir" });
    await user.click(button);

    expect(button).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("disables the button while loading", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button loading onClick={onClick}>
        Salvando
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Salvando" });
    await user.click(button);

    expect(button).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders left and right icons when not loading", () => {
    render(
      <Button
        leftIcon={<Check data-testid="left-icon" />}
        rightIcon={<ChevronRight data-testid="right-icon" />}
      >
        Continuar
      </Button>,
    );

    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });

  it("hides the right icon when loading", () => {
    render(
      <Button loading rightIcon={<ChevronRight data-testid="right-icon" />}>
        Carregando
      </Button>,
    );

    expect(screen.queryByTestId("right-icon")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Button className="custom-action">Custom</Button>);

    expect(screen.getByRole("button", { name: "Custom" })).toHaveClass(
      "custom-action",
    );
  });
});
