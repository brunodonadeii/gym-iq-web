import { describe, expect, it, vi } from "vitest";

const { authFetchSpy, parseApiResponseSpy, useQuerySpy } = vi.hoisted(() => ({
  authFetchSpy: vi.fn(),
  parseApiResponseSpy: vi.fn(),
  useQuerySpy: vi.fn((config) => config),
}));

vi.mock("@/services/api", () => ({
  authFetch: authFetchSpy,
}));

vi.mock("@/utils/apiError", () => ({
  parseApiResponse: parseApiResponseSpy,
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQuerySpy,
}));

import { useGetPaymentById } from "./useGetPaymentById";

describe("useGetPaymentById", () => {
  it("fetches a payment by id and respects enabled flag", async () => {
    const response = new Response(null, { status: 200 });
    authFetchSpy.mockResolvedValue(response);
    parseApiResponseSpy.mockResolvedValue({ paymentId: 1 });

    useGetPaymentById("1", false);
    const query = useQuerySpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    await query.queryFn();

    expect(query.queryKey).toEqual(["payments", "1"]);
    expect(query.enabled).toBe(false);
    expect(authFetchSpy).toHaveBeenCalledWith("payments/1");
    expect(parseApiResponseSpy).toHaveBeenCalledWith(response, "Erro ao buscar pagamento");
  });
});
