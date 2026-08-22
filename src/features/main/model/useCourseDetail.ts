import { useQuery } from '@tanstack/react-query';
import type { Course } from '@/domain/types';
import { courseRepository } from '@/features/main/api/courseRepository';

/**
 * 코스 상세 (GET /courses/{id}).
 * 목록 응답은 요약이라 경유지(`waypointAnchors`)·경로가 없다 → 코스정보 팝업은 상세를 따로 조회한다.
 * `enabled`로 팝업이 열릴 때만 호출한다.
 */
export function useCourseDetail(courseId: string | undefined, enabled: boolean) {
  return useQuery<Course>({
    queryKey: ['course', courseId],
    queryFn: () => courseRepository.getById(courseId as string),
    enabled: enabled && !!courseId,
    staleTime: 5 * 60 * 1000,
  });
}
