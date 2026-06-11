import type { Presence } from "@/pages/Presences/types";
import { authFetch } from "@/services/api";
import type { PageResponse } from "@/types/pagination";
import { parseApiResponse } from "@/utils/apiError";
import { buildPaginationParams } from "@/utils/pagination";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 5;

async function fetchMyPresences(page: number): Promise<PageResponse<Presence>> {
  const response = await authFetch(
    `presences/me?${buildPaginationParams({
      page,
      size: PAGE_SIZE,
      sort: "checkInAt,desc",
    })}`,
  );

  return parseApiResponse(response, "Erro ao buscar minhas presenças");
}

export function useGetMyPresences() {
  const query = useInfiniteQuery({
    queryKey: ["presences", "me"],
    queryFn: ({ pageParam = 0 }) => fetchMyPresences(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    staleTime: 60 * 1000,
  });

  return {
    ...query,
    data: query.data?.pages.flatMap((page) => page.content) ?? [],
  };
}

