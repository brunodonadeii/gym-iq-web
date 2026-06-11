import { describe, expect, it, vi } from "vitest";

const { authFetchSpy, parseApiResponseSpy, queryClient, useMutationSpy } = vi.hoisted(
  () => ({
    authFetchSpy: vi.fn(),
    parseApiResponseSpy: vi.fn(),
    queryClient: { invalidateQueries: vi.fn() },
    useMutationSpy: vi.fn((config) => config),
  }),
);

vi.mock("@/services/api", () => ({ authFetch: authFetchSpy }));
vi.mock("@/utils/apiError", () => ({ parseApiResponse: parseApiResponseSpy }));
vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationSpy,
  useQueryClient: () => queryClient,
}));

import { useCreatePayment } from "./useCreatePayment";

describe("useCreatePayment", () => {
  it("creates a payment normalizing optional fields and invalidates payments", async () => {
    useCreatePayment();
    const mutation = useMutationSpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    const variables = {
      enrollmentId: "10",
      dueDate: "2026-06-30",
      amount: "99.90",
      paymentMethod: "PIX",
      notes: " observação ",
    };
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({ paymentId: 1 });

    await mutation.mutationFn(variables);

    expect(authFetchSpy).toHaveBeenCalledWith("payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enrollmentId: "10",
        dueDate: "2026-06-30",
        amount: 99.9,
        paymentMethod: "PIX",
        notes: "observação",
      }),
    });
    mutation.onSuccess();
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["payments"] });
  });
});
