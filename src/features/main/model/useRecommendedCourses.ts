import { useQuery } from '@tanstack/react-query';
import type { Course } from '@/domain/types';
import { courseRepository } from '@/features/main/api/courseRepository';

export function useRecommendedCourses(regionCode: string) {
  return useQuery<Course[]>({
    queryKey: ['courses', regionCode],
    queryFn: () => courseRepository.listRecommended(regionCode),
  });
}
