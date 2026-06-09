import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query 클라이언트 (P-2).
 * - 쿼리: retry 1회 + 지수 백오프
 * - 변이: retry 0 (중복 부작용 방지)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
