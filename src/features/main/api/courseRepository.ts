import type { CourseRepository } from '@/domain/repositories';
import type { Course } from '@/domain/types';
import { apiClient } from '@/shared/api/apiClient';

export const courseRepository: CourseRepository = {
  listRecommended(regionCode: string): Promise<Course[]> {
    return apiClient.get<Course[]>(`/courses?regionCode=${encodeURIComponent(regionCode)}`);
  },
  getById(courseId: string): Promise<Course> {
    return apiClient.get<Course>(`/courses/${encodeURIComponent(courseId)}`);
  },
};
