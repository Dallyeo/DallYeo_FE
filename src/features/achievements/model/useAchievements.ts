import { useQuery } from '@tanstack/react-query';
import type { Achievement } from '@/domain/types';
import { achievementRepository } from '@/features/achievements/api/achievementRepository';

/** 업적 목록 (V14). 로그인 상태에서만 조회 — 백엔드 `GET /achievements`(고정 8종). */
export function useAchievements(enabled: boolean) {
  return useQuery<Achievement[]>({
    queryKey: ['achievements'],
    queryFn: () => achievementRepository.list(),
    enabled,
  });
}
