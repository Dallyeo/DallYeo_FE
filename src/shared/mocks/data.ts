import type { Course, Region } from '@/domain/types';
import { DEFAULT_REGION_CODE } from '@/domain/constants';

/** MVP1: 군산만 (NFR-DATA-02 — 동적 구조, 데이터만 단일) */
export const mockRegions: Region[] = [{ code: DEFAULT_REGION_CODE, name: '군산' }];

export const mockCourses: Course[] = [
  {
    id: 'c1',
    title: '군산 원도심 근대문화 코스',
    description: '근대 건축물을 따라 달리는 평지 코스.',
    distanceKm: 4.2,
    estimatedTime: '약 30분',
    previewImageUrl: 'https://placehold.co/600x300?text=Course+1',
    regionCode: DEFAULT_REGION_CODE,
  },
  {
    id: 'c2',
    title: '은파호수공원 둘레길',
    description: '호수를 한 바퀴 도는 완만한 코스.',
    distanceKm: 6.0,
    estimatedTime: '약 45분',
    previewImageUrl: 'https://placehold.co/600x300?text=Course+2',
    regionCode: DEFAULT_REGION_CODE,
  },
];
