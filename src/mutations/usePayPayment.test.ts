import { describe, expect, it, vi } from "vitest";

const {
  authFetchSpy,
  parseApiResponseSpy,
  queryClient,
  studentDeletionEligibilityKeysMock,
  useMutationSpy,
} = vi.hoisted(() => ({
  authFetchSpy: vi.fn(),
  parseApiResponseSpy: vi.fn(),
  queryClient: { invalidateQueries: vi.fn() },
  studentDeletionEligibilityKeysMock: { all: ["student-personal-data-eligibility"] },
  useMutationSpy: vi.fn((config) => config),
}));

vi.mock("@/queries/useGetStudentPersonalDataDeletionEligibility", () => ({
  studentDeletionEligibilityKeys: studentDeletionEligibilityKeysMock,
}));
vi.mock("@/services/api", () => ({ authFetch: authFetchSpy }));
vi.mock("@/utils/apiError", () => ({ parseApiResponse: parseApiResponseSpy }));
vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationSpy,
  useQueryClient: () => queryClient,
}));

import { usePayPayment } from "./usePayPayment";

describe("usePayPayment", () => {
  it("pays a payment normalizing paidAt and invalidates related queries", async () => {
    usePayPayment();
    const mutation = useMutationSpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    const variables = {
      id: "2",
      data: {
        paidAt: "2026-06-10T08:30",
        paymentMethod: "PIX",
        notes: " pago ",
      },
    };
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({ paymentId: 2 });

    await mutation.mutationFn(variables);

    expect(authFetchSpy).toHaveBeenCalledWith("payments/2/pay", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paidAt: "2026-06-10T08:30:00",
        paymentMethod: "PIX",
        notes: "pago",
      }),
    });
    mutation.onSuccess();
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["payments"] });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: studentDeletionEligibilityKeysMock.all,
    });
  });
});
