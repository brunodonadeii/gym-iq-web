import { describe, expect, it, vi } from "vitest";

const createRouterSpy = vi.fn((config) => ({
  ...config,
  __type: "router",
}));

const routeTreeMock = { id: "route-tree" };
const authMock = {
  isAuthenticated: true,
  token: "token",
  role: "ADMIN",
  hasAnyRole: vi.fn(),
};

vi.mock("@tanstack/react-router", () => ({
  createRouter: createRouterSpy,
}));

vi.mock("./routeTree.gen", () => ({
  routeTree: routeTreeMock,
}));

vi.mock("./utils/auth", () => ({
  auth: authMock,
}));

describe("router", () => {
  it("creates the router with the route tree and auth context", async () => {
    const { router } = await import("./router");

    expect(createRouterSpy).toHaveBeenCalledWith({
      routeTree: routeTreeMock,
      context: {
        auth: authMock,
      },
    });
    expect(router).toMatchObject({
      __type: "router",
      routeTree: routeTreeMock,
      context: {
        auth: authMock,
      },
    });
  });
});
