import type { StudentOption } from "@/pages/Students/types";
import { authFetch } from "@/services/api";
import type { PageResponse } from "@/types/pagination";
import { parseApiResponse } from "@/utils/apiError";
import { useInfiniteQuery } from "@tanstack/react-query";

const STUDENT_OPTIONS_PAGE_SIZE = 20;

type StudentOptionsResponse = PageResponse<StudentOption> | StudentOption[];

const normalizeStudentOptionsResponse = (
  data: StudentOptionsResponse,
  page: number,
): PageResponse<StudentOption> => {
  if (Array.isArray(data)) {
    return {
      content: data,
      totalElements: data.length,
      totalPages:
        data.length >= STUDENT_OPTIONS_PAGE_SIZE ? page + 2 : page + 1,
      size: STUDENT_OPTIONS_PAGE_SIZE,
      number: page,
      first: page === 0,
      last: data.length < STUDENT_OPTIONS_PAGE_SIZE,
    };
  }

  return data;
};

async function fetchStudentOptions(
  search: string,
  page: number,
): Promise<PageResponse<StudentOption>> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(STUDENT_OPTIONS_PAGE_SIZE),
  });

  if (search) {
    params.set("q", search);
  }

  const response = await authFetch(`students/options?${params.toString()}`);
  const data = await parseApiResponse<StudentOptionsResponse>(
    response,
    "Erro ao buscar opções de alunos",
  );

  return normalizeStudentOptionsResponse(data, page);
}

export function useGetStudentOptions(search = "", enabled = true) {
  const query = useInfiniteQuery({
    queryKey: ["students", "options", search],
    queryFn: ({ pageParam = 0 }) => fetchStudentOptions(search, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.last) {
        return undefined;
      }

      const previousIds = new Set(
        allPages
          .slice(0, -1)
          .flatMap((page) => page.content)
          .map((student) => student.studentId),
      );
      const introducedNewStudent = lastPage.content.some(
        (student) => !previousIds.has(student.studentId),
      );

      if (!introducedNewStudent) {
        return undefined;
      }

      return lastPage.number + 1;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const mergedStudents = query.data?.pages.flatMap((page) => page.content) ?? [];
  const uniqueStudents = Array.from(
    new Map(
      mergedStudents.map((student) => [student.studentId, student] as const),
    ).values(),
  );

  return {
    ...query,
    data: uniqueStudents,
  };
}
