import type { Instructor } from "@/pages/Instructors/types";
import { authFetch } from "@/services/api";
import type { PageResponse } from "@/types/pagination";
import { parseApiResponse } from "@/utils/apiError";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 20;

async function fetchInstructorOptions(search: string, page: number) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(PAGE_SIZE),
    status: "ACTIVE",
  });

  if (search.trim()) params.set("q", search.trim());

  const endpoint = search.trim() ? "instructors/search" : "instructors";
  const response = await authFetch(`${endpoint}?${params.toString()}`);

  return parseApiResponse<PageResponse<Instructor>>(
    response,
    "Erro ao buscar opções de instrutores",
  );
}

export function useGetInstructorOptions(search = "", enabled = true) {
  const query = useInfiniteQuery({
    queryKey: ["instructors", "options", search],
    queryFn: ({ pageParam = 0 }) => fetchInstructorOptions(search, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const instructors =
    query.data?.pages.flatMap((page) => page.content) ?? [];

  return {
    ...query,
    data: Array.from(
      new Map(
        instructors.map(
          (instructor) => [instructor.instructorId, instructor] as const,
        ),
      ).values(),
    ),
  };
}
