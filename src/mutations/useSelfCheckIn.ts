import type {
  PresenceCheckInResponse,
  SelfCheckInPayload,
} from "@/pages/PresenceCheckIn/types";
import { useMutation } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

interface ApiError {
  erro?: string;
  mensagem?: string;
  message?: string;
}

async function selfCheckIn(payload: SelfCheckInPayload) {
  const response = await fetch(`${API_URL}/presences/self-check-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
}

export function useSelfCheckIn() {
  return useMutation<PresenceCheckInResponse, ApiError, SelfCheckInPayload>({
    mutationFn: selfCheckIn,
  });
}
