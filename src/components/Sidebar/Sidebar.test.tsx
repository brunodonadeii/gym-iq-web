import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { Sidebar } from "./Sidebar";

const { clearAuthStorageSpy, navigateSpy } = vi.hoisted(() => ({
  clearAuthStorageSpy: vi.fn(),
  navigateSpy: vi.fn(),
}));

vi.mock("@/utils/auth", () => ({
  clearAuthStorage: clearAuthStorageSpy,
}));

vi.mock("../ThemeToggle/ThemeToggle", () => ({
  ThemeToggle: () => <button type="button">Alternar tema</button>,
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    className,
    onClick,
  }: {
    children: ReactNode;
    to: string;
    className?: string;
    onClick?: () => void;
  }) => (
    <a href={to} className={className} onClick={onClick}>
      {children}
    </a>
  ),
  useNavigate: () => navigateSpy,
}));

const items = [
  {
    label: "Dashboard",
    icon: <span data-testid="dashboard-icon" />,
    to: "/dashboard",
  },
  {
    label: "Alunos",
    icon: <span data-testid="students-icon" />,
    to: "/students",
  },
];

describe("Sidebar", () => {
  const getMenuButton = () =>
    screen.getByText("Menu").closest("button") as HTMLButtonElement;

  it("renders desktop navigation items and the visible theme toggle", () => {
    render(<Sidebar items={items} />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByRole("link", { name: "Alunos" })).toHaveAttribute(
      "href",
      "/students",
    );
    expect(screen.getAllByRole("button", { name: "Alternar tema" })).toHaveLength(1);
  });

  it("opens the mobile drawer and restores focus to the menu button when closed", async () => {
    navigateSpy.mockClear();
    clearAuthStorageSpy.mockClear();
    render(<Sidebar items={items} />);

    const menuButton = getMenuButton();
    fireEvent.click(menuButton);

    const drawer = screen.getByRole("dialog", { name: "Navegação" });

    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(drawer).toBeInTheDocument();
    await waitFor(() =>
      expect(within(drawer).getByRole("button", { name: "Fechar menu" })).toHaveFocus(),
    );

    fireEvent.click(within(drawer).getByRole("button", { name: "Fechar menu" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    expect(menuButton).toHaveFocus();
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the drawer when a navigation link is selected or Escape is pressed", async () => {
    navigateSpy.mockClear();
    clearAuthStorageSpy.mockClear();
    render(<Sidebar items={items} />);

    fireEvent.click(getMenuButton());
    let drawer = screen.getByRole("dialog");
    expect(drawer).toBeInTheDocument();

    fireEvent.click(within(drawer).getByRole("link", { name: "Alunos" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    fireEvent.click(getMenuButton());
    drawer = screen.getByRole("dialog");
    expect(drawer).toBeInTheDocument();

    fireEvent.keyDown(drawer, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("clears the session and redirects to login on desktop logout", async () => {
    navigateSpy.mockClear();
    clearAuthStorageSpy.mockClear();
    render(<Sidebar items={items} />);

    fireEvent.click(screen.getByRole("button", { name: "Sair" }));

    expect(clearAuthStorageSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith({ to: "/login" });
  });

  it("closes the drawer before redirecting on mobile logout", async () => {
    navigateSpy.mockClear();
    clearAuthStorageSpy.mockClear();
    render(<Sidebar items={items} />);

    fireEvent.click(getMenuButton());
    const drawer = screen.getByRole("dialog");
    expect(drawer).toBeInTheDocument();

    fireEvent.click(within(drawer).getByRole("button", { name: "Sair" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    expect(clearAuthStorageSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith({ to: "/login" });
  });
});
