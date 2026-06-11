import { describe, expect, it, vi } from "vitest";

const { redirectSpy } = vi.hoisted(() => ({
  redirectSpy: vi.fn((options: { to: string }) => ({
    type: "redirect",
    ...options,
  })),
}));

vi.mock("@tanstack/react-router", () => ({
  redirect: redirectSpy,
}));

import { requireRoles } from "./-guards";

describe("requireRoles", () => {
  it("does nothing when the current user has one of the allowed roles", () => {
    const context = {
      auth: {
        hasAnyRole: vi.fn(() => true),
      },
    };

    expect(() => requireRoles(context, ["ADMIN", "RECEPTION"])).not.toThrow();
    expect(context.auth.hasAnyRole).toHaveBeenCalledWith([
      "ADMIN",
      "RECEPTION",
    ]);
    expect(redirectSpy).not.toHaveBeenCalled();
  });

  it("throws a redirect to unauthorized when the user lacks the required roles", () => {
    const context = {
      auth: {
        hasAnyRole: vi.fn(() => false),
      },
    };

    try {
      requireRoles(context, ["ADMIN"]);
      throw new Error("Expected requireRoles to throw");
    } catch (error) {
      expect(error).toEqual({
        type: "redirect",
        to: "/unauthorized",
      });
    }

    expect(redirectSpy).toHaveBeenCalledWith({ to: "/unauthorized" });
  });
});
