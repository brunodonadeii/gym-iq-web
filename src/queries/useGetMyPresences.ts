import type { Presence } from "@/pages/Presences/types";
import { authFetch } from "@/services/api";
import type { PageRequest, PageResponse } from "@/types/pagination";
import { parseApiResponse } from "@/utils/apiError";
import { buildPaginationParams } from "@/utils/pagination";
import { useQuery } from "@tanstack/react-query";

const DEFAULT_MY_PRESENCES_PAGE: PageRequest = {
  page: 0,
  size: 5,
  sort: "checkInAt,desc",
};

async function fetchMyPresences(
  pagination: PageRequest,
): Promise<PageResponse<Presence>> {
  const response = await authFetch(
    `presences/me?${buildPaginationParams(pagination)}`,
  );

  return parseApiResponse(response, "Erro ao buscar minhas presencas");
}

export function useGetMyPresences(
  pagination: PageRequest = DEFAULT_MY_PRESENCES_PAGE,
) {
  return useQuery({
    queryKey: ["presences", "me", pagination],
    queryFn: () => fetchMyPresences(pagination),
    staleTime: 60 * 1000,
  });
}
