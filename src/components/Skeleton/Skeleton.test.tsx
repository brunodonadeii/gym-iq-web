import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("uses the default dimensions and hides itself from assistive technology", () => {
    render(<Skeleton data-testid="skeleton" />);

    const skeleton = screen.getByTestId("skeleton");

    expect(skeleton).toHaveAttribute("aria-hidden", "true");
    expect(skeleton).toHaveStyle({
      width: "100%",
      height: "1rem",
      borderRadius: "12px",
    });
  });

  it("applies custom dimensions and radius", () => {
    render(
      <Skeleton
        data-testid="skeleton"
        width={240}
        height="32px"
        radius="8px"
      />,
    );

    expect(screen.getByTestId("skeleton")).toHaveStyle({
      width: "240px",
      height: "32px",
      borderRadius: "8px",
    });
  });

  it("uses a circular radius when circle is enabled", () => {
    render(
      <Skeleton data-testid="skeleton" width={48} height={48} circle />,
    );

    expect(screen.getByTestId("skeleton")).toHaveStyle({
      width: "48px",
      height: "48px",
      borderRadius: "999px",
    });
  });

  it("allows style overrides and applies custom attributes", () => {
    render(
      <Skeleton
        data-testid="skeleton"
        className="profile-placeholder"
        width={100}
        style={{ width: 180, opacity: 0.5 }}
        title="Carregando perfil"
      />,
    );

    const skeleton = screen.getByTestId("skeleton");

    expect(skeleton).toHaveClass("profile-placeholder");
    expect(skeleton).toHaveAttribute("title", "Carregando perfil");
    expect(skeleton).toHaveStyle({
      width: "180px",
      opacity: "0.5",
    });
  });
});
