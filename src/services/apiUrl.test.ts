import { afterEach, describe, expect, it, vi } from "vitest";

describe("buildApiUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("uses the default api base when VITE_API_URL is not defined", async () => {
    vi.resetModules();
    vi.unstubAllEnvs();
    const { buildApiUrl } = await import("./apiUrl");

    expect(buildApiUrl("students")).toBe(
      "https://api.gymiq.gusoaresfdev.com.br/api/students",
    );
  });

  it("normalizes custom base urls with trailing slash and missing /api", async () => {
    vi.stubEnv("VITE_API_URL", "https://custom.test/");
    vi.resetModules();
    const { buildApiUrl } = await import("./apiUrl");

    expect(buildApiUrl("/plans")).toBe("https://custom.test/api/plans");
  });

  it("preserves custom base urls that already end with /api", async () => {
    vi.stubEnv("VITE_API_URL", "https://custom.test/api");
    vi.resetModules();
    const { buildApiUrl } = await import("./apiUrl");

    expect(buildApiUrl("enrollments")).toBe(
      "https://custom.test/api/enrollments",
    );
  });
});
