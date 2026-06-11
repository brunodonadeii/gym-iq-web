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

import { useUpdateInstructor } from "./useUpdateInstructor";

describe("useUpdateInstructor", () => {
  it("updates an instructor trimming specialty and invalidates instructors", async () => {
    useUpdateInstructor();
    const mutation = useMutationSpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    const variables = {
      id: "1",
      data: {
        name: "Marina",
        email: "marina@test.com",
        cref: "123456-G/SP",
        phone: "11999999999",
        specialty: " Hipertrofia ",
      },
    };
    const response = new Response(null, { status: 200 });
    authFetchSpy.mockResolvedValue(response);
    parseApiResponseSpy.mockResolvedValue({ instructorId: 1 });

    await mutation.mutationFn(variables);

    expect(authFetchSpy).toHaveBeenCalledWith("instructors/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Marina",
        email: "marina@test.com",
        cref: "123456-G/SP",
        phone: "11999999999",
        specialty: "Hipertrofia",
      }),
    });
    mutation.onSuccess();
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["instructors"],
    });
  });
});
