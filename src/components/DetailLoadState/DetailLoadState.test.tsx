import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DetailLoadState } from "./DetailLoadState";

const entity = {
  name: "Aluno",
  article: "este" as const,
  pronoun: "ele" as const,
};

describe("DetailLoadState", () => {
  it("renders the not found state by default", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();

    render(<DetailLoadState entity={entity} onBack={onBack} />);

    expect(screen.getByText("Aluno não encontrado")).toBeInTheDocument();
    expect(
      screen.getByText("Não foi possível carregar este aluno."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Verifique se ele ainda existe ou volte para a listagem.",
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Voltar para listagem" }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renders the invalid identifier state", () => {
    render(
      <DetailLoadState
        entity={entity}
        listLabel="tabela de alunos"
        error={{ statusCode: 400 }}
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByText("Identificador inválido")).toBeInTheDocument();
    expect(
      screen.getByText(
        "O identificador informado é inválido. Volte para a tabela de alunos e tente acessar novamente.",
      ),
    ).toBeInTheDocument();
  });

  it("renders the generic load error state", () => {
    render(
      <DetailLoadState
        entity={entity}
        error={{ statusCode: 500 }}
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByText("Erro ao carregar aluno")).toBeInTheDocument();
    expect(
      screen.getByText("Tente novamente em instantes ou volte para a listagem."),
    ).toBeInTheDocument();
  });
});
