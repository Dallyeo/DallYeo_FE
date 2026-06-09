import type { Course } from '@/domain/types';

/** 코스 Repository (계약). 구현은 U3에서(백엔드/MSW). */
export interface CourseRepository {
  /** 지역별 추천 코스 목록. 빈 배열 가능(Empty 상태). */
  listRecommended(regionCode: string): Promise<Course[]>;
  getById(courseId: string): Promise<Course>;
}
