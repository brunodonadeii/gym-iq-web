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

import { useCreateExercise } from "./useCreateExercise";

describe("useCreateExercise", () => {
  it("creates an exercise and invalidates exercises", async () => {
    useCreateExercise();
    const mutation = useMutationSpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    const variables = {
      data: {
        name: "Agachamento",
        muscleGroup: "Pernas",
        description: "",
      },
    };
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({ exerciseId: 1 });

    await mutation.mutationFn(variables);

    expect(authFetchSpy).toHaveBeenCalledWith("exercises", {
      method: "POST",
      body: JSON.stringify({
        name: "Agachamento",
        muscleGroup: "Pernas",
        description: undefined,
      }),
    });
    mutation.onSuccess();
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["exercises"] });
  });
});
