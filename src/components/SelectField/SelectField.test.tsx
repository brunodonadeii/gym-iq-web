import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SelectField } from "./SelectField";

const options = [
  { label: "Ativo", value: "ACTIVE" },
  { label: "Inativo", value: "INACTIVE" },
  { label: "Indisponível", value: "UNAVAILABLE", disabled: true },
];

describe("SelectField", () => {
  it("shows the selected label and stores the form value", () => {
    const { container } = render(
      <SelectField
        id="status"
        name="status"
        label="Status"
        value="ACTIVE"
        options={options}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Status" })).toHaveTextContent(
      "Ativo",
    );

    const hiddenInput = container.querySelector<HTMLInputElement>(
      'input[type="hidden"]',
    );
    expect(hiddenInput).toHaveAttribute("id", "status");
    expect(hiddenInput).toHaveAttribute("name", "status");
    expect(hiddenInput).toHaveValue("ACTIVE");
  });

  it("shows a fallback when no option matches the value", () => {
    render(
      <SelectField
        id="status"
        label="Status"
        value=""
        options={options}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Status" })).toHaveTextContent(
      "Selecione",
    );
  });

  it("emits a select-like change event when an option is chosen", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SelectField
        id="status"
        name="studentStatus"
        label="Status"
        value="ACTIVE"
        options={options}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Status" }));
    await user.click(screen.getByRole("menuitem", { name: "Inativo" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].target).toMatchObject({
      value: "INACTIVE",
      name: "studentStatus",
      id: "status",
    });
  });

  it("does not select disabled options", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SelectField
        id="status"
        label="Status"
        value="ACTIVE"
        options={options}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Status" }));

    const unavailable = screen.getByRole("menuitem", {
      name: "Indisponível",
    });
    expect(unavailable).toHaveAttribute("data-disabled");
    await user.click(unavailable);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("connects helper and error messages to the trigger", () => {
    const { rerender } = render(
      <SelectField
        id="status"
        label="Status"
        value=""
        options={options}
        onChange={vi.fn()}
        helperText="Escolha uma situação."
      />,
    );

    const trigger = screen.getByRole("button", { name: "Status" });
    expect(trigger).toHaveAttribute("aria-describedby", "status-helper");
    expect(trigger).toHaveAttribute("aria-invalid", "false");
    expect(screen.getByText("Escolha uma situação.")).toBeInTheDocument();

    rerender(
      <SelectField
        id="status"
        label="Status"
        value=""
        options={options}
        onChange={vi.fn()}
        helperText="Escolha uma situação."
        error="Selecione um status."
      />,
    );

    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Selecione um status.")).toBeInTheDocument();
    expect(screen.queryByText("Escolha uma situação.")).not.toBeInTheDocument();
  });

  it("supports required, optional, disabled and container attributes", () => {
    const { container, rerender } = render(
      <SelectField
        id="status"
        label="Status"
        value=""
        options={options}
        onChange={vi.fn()}
        required
        disabled
        containerProps={{
          className: "status-field",
          title: "Filtro de status",
        }}
      />,
    );

    expect(screen.getByRole("button", { name: "Status" })).toBeDisabled();
    expect(container.querySelector('input[type="hidden"]')).toHaveAttribute(
      "required",
    );
    expect(container.querySelector(".status-field")).toHaveAttribute(
      "title",
      "Filtro de status",
    );
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");

    rerender(
      <SelectField
        id="status"
        label="Status"
        value=""
        options={options}
        onChange={vi.fn()}
        optional
      />,
    );

    expect(screen.getByText("(opcional)")).toBeInTheDocument();
  });
});
