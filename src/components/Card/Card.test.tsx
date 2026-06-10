import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
  it("renders its children", () => {
    render(
      <Card>
        <h2>Resumo financeiro</h2>
        <p>Conteúdo do card</p>
      </Card>,
    );

    expect(
      screen.getByRole("heading", { name: "Resumo financeiro" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Conteúdo do card")).toBeInTheDocument();
  });
});
