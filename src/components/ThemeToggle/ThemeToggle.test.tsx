import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("uses dark theme by default and switches to light", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Alternar tema" });

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("data-theme", "dark");
      expect(localStorage.getItem("theme")).toBe("dark");
    });
    expect(button.querySelector(".lucide-sun")).toBeInTheDocument();

    await user.click(button);

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("data-theme", "light");
      expect(localStorage.getItem("theme")).toBe("light");
    });
    expect(button.querySelector(".lucide-moon")).toBeInTheDocument();
  });

  it("restores a stored light theme and switches to dark", async () => {
    localStorage.setItem("theme", "light");
    const user = userEvent.setup();

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Alternar tema" });

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("data-theme", "light");
    });
    expect(button.querySelector(".lucide-moon")).toBeInTheDocument();

    await user.click(button);

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("data-theme", "dark");
      expect(localStorage.getItem("theme")).toBe("dark");
    });
    expect(button.querySelector(".lucide-sun")).toBeInTheDocument();
  });
});
