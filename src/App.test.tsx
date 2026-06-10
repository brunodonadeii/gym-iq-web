import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  queryClientProviderSpy,
  routerMock,
  routerProviderSpy,
  toasterSpy,
} = vi.hoisted(() => ({
  routerMock: { id: "router-mock" },
  queryClientProviderSpy: vi.fn(),
  routerProviderSpy: vi.fn(),
  toasterSpy: vi.fn(),
}));

vi.mock("./router", () => ({
  router: routerMock,
}));

vi.mock("@tanstack/react-query", () => ({
  QueryClient: vi.fn(function QueryClientMock(this: Record<string, unknown>, config: unknown) {
    this.id = "query-client-mock";
    this.config = config;
  }),
  QueryClientProvider: ({
    children,
    client,
  }: {
    children: ReactNode;
    client: unknown;
  }) => {
    queryClientProviderSpy(client);
    return <div data-testid="query-client-provider">{children}</div>;
  },
}));

vi.mock("@tanstack/react-router", () => ({
  RouterProvider: ({ router }: { router: unknown }) => {
    routerProviderSpy(router);
    return <div data-testid="router-provider">Router mounted</div>;
  },
}));

vi.mock("sonner", () => ({
  Toaster: (props: unknown) => {
    toasterSpy(props);
    return <div data-testid="toaster" />;
  },
}));

import App from "./App";

describe("App", () => {
  beforeEach(() => {
    queryClientProviderSpy.mockClear();
    routerProviderSpy.mockClear();
    toasterSpy.mockClear();
  });

  it("renders the toaster and application providers", () => {
    render(<App />);

    expect(screen.getByTestId("toaster")).toBeInTheDocument();
    expect(screen.getByTestId("query-client-provider")).toBeInTheDocument();
    expect(screen.getByTestId("router-provider")).toHaveTextContent(
      "Router mounted",
    );
  });

  it("passes the configured router and query client to the providers", () => {
    render(<App />);

    expect(queryClientProviderSpy).toHaveBeenCalledWith({
      id: "query-client-mock",
      config: {
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      },
    });
    expect(queryClientProviderSpy).toHaveBeenCalledTimes(1);
    expect(routerProviderSpy).toHaveBeenCalledWith(routerMock);
    expect(toasterSpy).toHaveBeenCalledWith({
      position: "top-right",
      richColors: true,
    });
  });
});
