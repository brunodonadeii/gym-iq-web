import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormHeader } from "./FormHeader";

describe("FormHeader", () => {
  it("renders the welcome title and supporting text", () => {
    render(<FormHeader />);

    expect(
      screen.getByRole("heading", { level: 3, name: "Bem-vindo de volta" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Entre para continuar sua gestão"),
    ).toBeInTheDocument();
  });
});
