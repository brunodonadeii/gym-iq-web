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

import { useUpdateExercise } from "./useUpdateExercise";

describe("useUpdateExercise", () => {
  it("updates an exercise and invalidates exercises", async () => {
    useUpdateExercise();
    const mutation = useMutationSpy.mock.calls.at(-1)?.[0] as Record<string, any>;
    const variables = {
      id: "1",
      data: {
        name: "Leg press",
        muscleGroup: "Pernas",
        description: "Máquina",
      },
    };
    authFetchSpy.mockResolvedValue(new Response(null, { status: 200 }));
    parseApiResponseSpy.mockResolvedValue({ exerciseId: 1 });

    await mutation.mutationFn(variables);

    expect(authFetchSpy).toHaveBeenCalledWith("exercises/1", {
      method: "PUT",
      body: JSON.stringify({
        name: "Leg press",
        muscleGroup: "Pernas",
        description: "Máquina",
      }),
    });
    mutation.onSuccess();
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["exercises"] });
  });
});
