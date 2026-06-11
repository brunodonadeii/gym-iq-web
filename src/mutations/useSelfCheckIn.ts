import type {
  PresenceCheckInResponse,
  SelfCheckInPayload,
} from "@/pages/PresenceCheckIn/types";
import { parseApiResponse, type ApiError } from "@/utils/apiError";
import { buildApiUrl } from "@/services/apiUrl";
import { useMutation } from "@tanstack/react-query";

async function selfCheckIn(payload: SelfCheckInPayload) {
  const response = await fetch(buildApiUrl("presences/self-check-in"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse<PresenceCheckInResponse>(response);
}

export function useSelfCheckIn() {
  return useMutation<PresenceCheckInResponse, ApiError, SelfCheckInPayload>({
    mutationFn: selfCheckIn,
  });
}

