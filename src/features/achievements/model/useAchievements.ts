import { useQuery } from '@tanstack/react-query';
import type { Achievement } from '@/domain/types';
import { achievementRepository } from '@/features/achievements/api/achievementRepository';

/**
 * 업적 목록 (V14). 로그인 상태에서만 조회 — 백엔드 `GET /achievements` **21종**.
 * 분류(`category`) 3종을 한 번에 받아 화면에서 탭으로 나눈다(요청은 한 번뿐이다).
 */
export function useAchievements(enabled: boolean) {
  return useQuery<Achievement[]>({
    queryKey: ['achievements'],
    queryFn: () => achievementRepository.list(),
    enabled,
  });
}
