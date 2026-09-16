import type { CourseRepository } from '@/domain/repositories';
import type { Course, DistanceCategory } from '@/domain/types';
import { apiClient } from '@/shared/api/apiClient';
import { env } from '@/shared/config/env';

/** 백엔드 코스 응답 (backend-api.md §3). 목록은 요약, 상세는 polyline·경유지 포함. */
interface CourseDto {
  id: string;
  name: string;
  description?: string;
  region: string;
  distanceCategory?: DistanceCategory;
  totalMeters: number;
  waypointCount?: number;
  imageUrl?: string;
  polyline?: { lat: number; lng: number }[];
  cumulativeMeters?: number[];
  waypointAnchors?: { name: string; polylineIndex: number }[];
}

/**
 * 예상 소요 시간 — **백엔드에 필드가 없어** 거리로 추정한다.
 * 조깅 기준 6분/km(=360초/km). 실제 값이 생기면 이 함수를 제거하고 응답값을 쓸 것.
 */
function estimateTime(totalMeters: number): string {
  const minutes = Math.round((totalMeters / 1000) * 6);
  if (minutes < 60) return `약 ${minutes}분`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `약 ${h}시간` : `약 ${h}시간 ${m}분`;
}

function toCourse(d: CourseDto): Course {
  return {
    id: d.id,
    title: d.name,
    description: d.description ?? '',
    distanceKm: Math.round((d.totalMeters / 1000) * 100) / 100,
    estimatedTime: estimateTime(d.totalMeters),
    previewImageUrl: d.imageUrl ?? '',
    regionCode: d.region,
    ...(d.distanceCategory ? { distanceCategory: d.distanceCategory } : {}),
    ...(d.waypointAnchors ? { waypoints: d.waypointAnchors.map((w) => w.name) } : {}),
  };
}

/** 공개 API(코스). backend-api.md §3 — GET /courses?region= / GET /courses/{id} */
export const courseRepository: CourseRepository = {
  async listRecommended(regionCode: string): Promise<Course[]> {
    const rows = await apiClient.get<CourseDto[]>(
      `/courses?region=${encodeURIComponent(regionCode)}`,
      { baseUrl: env.publicApiBaseUrl },
    );
    return rows.map(toCourse);
  },
  async getById(courseId: string): Promise<Course> {
    const d = await apiClient.get<CourseDto>(`/courses/${encodeURIComponent(courseId)}`, {
      baseUrl: env.publicApiBaseUrl,
    });
    return toCourse(d);
  },
};
