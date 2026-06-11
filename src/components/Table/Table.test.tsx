import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableSkeletonRows,
} from "./Table";

describe("Table", () => {
  it("renders a semantic table with headers and cells", () => {
    render(
      <Table aria-label="Alunos">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Nome</TableHeaderCell>
            <TableHeaderCell center>Status</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Maria Silva</TableCell>
            <TableCell center>Ativa</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByRole("table", { name: "Alunos" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Nome" })).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Status" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Maria Silva" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Ativa" })).toBeInTheDocument();
  });

  it("applies column widths, minimum width and custom table attributes", () => {
    const { container } = render(
      <Table
        aria-label="Planos"
        columns={[{ width: "70%" }, { width: "30%" }]}
        minWidth="900px"
        className="plans-table"
        style={{ backgroundColor: "red" }}
      >
        <TableBody>
          <TableRow>
            <TableCell>Plano anual</TableCell>
            <TableCell>Ativo</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    const table = screen.getByRole("table", { name: "Planos" });
    const columns = container.querySelectorAll("col");

    expect(table).toHaveClass("plans-table");
    expect(table.style.minWidth).toBe("900px");
    expect(table.style.backgroundColor).toBe("red");
    expect(columns).toHaveLength(2);
    expect(columns[0]).toHaveStyle({ width: "70%" });
    expect(columns[1]).toHaveStyle({ width: "30%" });
  });

  it("forwards custom row and cell attributes", () => {
    render(
      <Table>
        <TableBody>
          <TableRow className="selected-row" data-testid="row">
            <TableCell className="name-cell" data-testid="cell">
              João
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByTestId("row")).toHaveClass("selected-row");
    expect(screen.getByTestId("cell")).toHaveClass("name-cell");
  });

  it("renders an empty state spanning all configured columns", () => {
    render(
      <Table>
        <TableBody>
          <TableEmptyState
            colSpan={4}
            message="Nenhum aluno encontrado."
          />
        </TableBody>
      </Table>,
    );

    const cell = screen.getByRole("cell", {
      name: "Nenhum aluno encontrado.",
    });

    expect(cell).toHaveAttribute("colspan", "4");
  });

  it("renders the requested number of skeleton rows and columns", () => {
    render(
      <Table>
        <TableBody>
          <TableSkeletonRows rows={3} columns={4} />
        </TableBody>
      </Table>,
    );

    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getAllByRole("cell")).toHaveLength(12);
    expect(document.querySelectorAll('[aria-hidden="true"]')).toHaveLength(12);
  });

  it("uses five skeleton rows by default", () => {
    render(
      <Table>
        <TableBody>
          <TableSkeletonRows columns={2} />
        </TableBody>
      </Table>,
    );

    expect(screen.getAllByRole("row")).toHaveLength(5);
    expect(screen.getAllByRole("cell")).toHaveLength(10);
  });
});
