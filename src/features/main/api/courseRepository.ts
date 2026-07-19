import type { CourseRepository } from '@/domain/repositories';
import type { Course } from '@/domain/types';
import { apiClient } from '@/shared/api/apiClient';
import { env } from '@/shared/config/env';

/** 공개 API(코스). be-api-spec-recieved-sprint4.md §3 — GET /courses?region= / GET /courses/{id} */
export const courseRepository: CourseRepository = {
  listRecommended(regionCode: string): Promise<Course[]> {
    return apiClient.get<Course[]>(`/courses?region=${encodeURIComponent(regionCode)}`, {
      baseUrl: env.publicApiBaseUrl,
    });
  },
  getById(courseId: string): Promise<Course> {
    return apiClient.get<Course>(`/courses/${encodeURIComponent(courseId)}`, {
      baseUrl: env.publicApiBaseUrl,
    });
  },
};
