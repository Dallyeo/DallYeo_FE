import { useQuery } from '@tanstack/react-query';
import type { UserProfile } from '@/domain/types';
import { profileRepository } from '@/features/settings/api/profileRepository';

/** 프로필 조회 (V13). 로그인 상태에서만. */
export function useProfile(enabled: boolean) {
  return useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: () => profileRepository.get(),
    enabled,
  });
}
