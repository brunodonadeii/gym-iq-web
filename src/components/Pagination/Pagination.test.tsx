import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "./Pagination";

const createPage = (
  overrides: Partial<{
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
  }> = {},
) => ({
  totalElements: 35,
  totalPages: 4,
  size: 10,
  number: 1,
  first: false,
  last: false,
  ...overrides,
});

describe("Pagination", () => {
  it("renders nothing without page data", () => {
    const { container } = render(
      <Pagination onPageChange={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the current item range and page position", () => {
    render(
      <Pagination page={createPage()} onPageChange={vi.fn()} />,
    );

    expect(screen.getByText("11-20")).toBeInTheDocument();
    expect(screen.getByText("de 35 registro(s)")).toBeInTheDocument();
    expect(screen.getByText("Página 2 de 4")).toBeInTheDocument();
  });

  it("uses the controlled current page when supplied", () => {
    render(
      <Pagination
        page={createPage({ number: 0 })}
        currentPage={2}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByText("21-30")).toBeInTheDocument();
    expect(screen.getByText("Página 3 de 4")).toBeInTheDocument();
  });

  it("navigates to the previous and next pages", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <Pagination page={createPage()} onPageChange={onPageChange} />,
    );

    await user.click(
      screen.getByRole("button", { name: "Página anterior" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Próxima página" }),
    );

    expect(onPageChange).toHaveBeenNthCalledWith(1, 0);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 2);
  });

  it("disables navigation at boundaries and while loading", () => {
    const { rerender } = render(
      <Pagination
        page={createPage({ number: 0, first: true })}
        onPageChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Página anterior" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Próxima página" }),
    ).toBeEnabled();

    rerender(
      <Pagination
        page={createPage({ number: 3, last: true })}
        onPageChange={vi.fn()}
        loading
      />,
    );

    expect(
      screen.getByRole("button", { name: "Página anterior" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Próxima página" }),
    ).toBeDisabled();
  });

  it("handles empty pages without invalid ranges", () => {
    render(
      <Pagination
        page={createPage({
          totalElements: 0,
          totalPages: 0,
          number: 0,
          first: true,
          last: true,
        })}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByText("0-0")).toBeInTheDocument();
    expect(screen.getByText("Página 1 de 1")).toBeInTheDocument();
  });

  it("changes the page size using the configured options", async () => {
    const user = userEvent.setup();
    const onSizeChange = vi.fn();

    render(
      <Pagination
        page={createPage()}
        onPageChange={vi.fn()}
        onSizeChange={onSizeChange}
        sizeOptions={[10, 25, 100]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Itens" }));
    await user.click(screen.getByRole("menuitem", { name: "25" }));

    expect(onSizeChange).toHaveBeenCalledWith(25);
  });
});
