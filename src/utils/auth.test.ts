import { beforeEach, describe, expect, it } from "vitest";
import { auth, clearAuthStorage } from "./auth";

const createToken = (payload: Record<string, unknown>) => {
  const encode = (value: Record<string, unknown>) =>
    btoa(JSON.stringify(value))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");

  return `${encode({ alg: "none", typ: "JWT" })}.${encode(payload)}.signature`;
};

describe("auth", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("derives the current role from the JWT payload", () => {
    localStorage.setItem(
      "token",
      createToken({
        exp: Math.floor(Date.now() / 1000) + 60,
        role: "ROLE_ADMIN",
      }),
    );

    expect(auth.role).toBe("ADMIN");
    expect(auth.hasAnyRole(["ADMIN"])).toBe(true);
  });

  it("ignores a tampered role stored outside the token", () => {
    localStorage.setItem(
      "token",
      createToken({
        exp: Math.floor(Date.now() / 1000) + 60,
        role: "STUDENT",
      }),
    );
    localStorage.setItem("role", "ADMIN");

    expect(auth.role).toBe("STUDENT");
    expect(auth.hasAnyRole(["ADMIN"])).toBe(false);
  });

  it("supports authority objects from JWT payloads", () => {
    localStorage.setItem(
      "token",
      createToken({
        exp: Math.floor(Date.now() / 1000) + 60,
        authorities: [{ authority: "ROLE_INSTRUCTOR" }],
      }),
    );

    expect(auth.role).toBe("INSTRUCTOR");
  });

  it("clears the legacy stored role with auth storage", () => {
    localStorage.setItem("token", "token");
    localStorage.setItem("role", "ADMIN");

    clearAuthStorage();

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("role")).toBeNull();
  });
});
