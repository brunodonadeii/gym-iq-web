import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  buildApiUrlSpy,
  clearAuthStorageSpy,
  parseApiResponseSpy,
} = vi.hoisted(() => ({
  buildApiUrlSpy: vi.fn((path: string) => `https://api.test/${path}`),
  clearAuthStorageSpy: vi.fn(),
  parseApiResponseSpy: vi.fn(),
}));

vi.mock("@/services/apiUrl", () => ({
  buildApiUrl: buildApiUrlSpy,
}));

vi.mock("@/utils/auth", () => ({
  clearAuthStorage: clearAuthStorageSpy,
}));

vi.mock("@/utils/apiError", () => ({
  parseApiResponse: parseApiResponseSpy,
}));

import { forgotPassword, login, resetPassword } from "./auth";

describe("auth service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {});
  });

  it("logs in, clears previous auth state and persists the returned token", async () => {
    const response = new Response(null, { status: 200 });
    const authResponse = {
      token: "jwt-token",
      type: "Bearer",
      userId: "1",
      name: "Bruno",
      email: "bruno@test.com",
      role: "ADMIN",
    };

    vi.mocked(fetch).mockResolvedValue(response);
    parseApiResponseSpy.mockResolvedValue(authResponse);

    await expect(
      login({
        email: "bruno@test.com",
        password: "123456",
      }),
    ).resolves.toEqual(authResponse);

    expect(buildApiUrlSpy).toHaveBeenCalledWith("auth/login");
    expect(fetch).toHaveBeenCalledWith("https://api.test/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "bruno@test.com",
        password: "123456",
      }),
    });
    expect(parseApiResponseSpy).toHaveBeenCalledWith(
      response,
      "Não foi possível entrar. Confira seu e-mail e senha e tente novamente.",
    );
    expect(clearAuthStorageSpy).toHaveBeenCalledTimes(1);
    expect(localStorage.setItem).toHaveBeenCalledWith("token", "jwt-token");
  });

  it("requests forgot password with the expected payload and fallback message", async () => {
    const response = new Response(null, { status: 200 });
    const payload = { message: "ok" };

    vi.mocked(fetch).mockResolvedValue(response);
    parseApiResponseSpy.mockResolvedValue(payload);

    await expect(
      forgotPassword({
        email: "bruno@test.com",
      }),
    ).resolves.toEqual(payload);

    expect(buildApiUrlSpy).toHaveBeenCalledWith("auth/forgot-password");
    expect(fetch).toHaveBeenCalledWith("https://api.test/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "bruno@test.com",
      }),
    });
    expect(parseApiResponseSpy).toHaveBeenCalledWith(
      response,
      "Não foi possível solicitar a redefinição de senha.",
    );
  });

  it("requests password reset with the expected payload and fallback message", async () => {
    const response = new Response(null, { status: 200 });
    const payload = { message: "ok" };

    vi.mocked(fetch).mockResolvedValue(response);
    parseApiResponseSpy.mockResolvedValue(payload);

    await expect(
      resetPassword({
        token: "reset-token",
        newPassword: "nova-senha",
      }),
    ).resolves.toEqual(payload);

    expect(buildApiUrlSpy).toHaveBeenCalledWith("auth/reset-password");
    expect(fetch).toHaveBeenCalledWith("https://api.test/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: "reset-token",
        newPassword: "nova-senha",
      }),
    });
    expect(parseApiResponseSpy).toHaveBeenCalledWith(
      response,
      "Não foi possível redefinir a senha.",
    );
  });
});
