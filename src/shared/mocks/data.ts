import type { Course, NearbyPlace, Region } from '@/domain/types';
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

/** 완주 위치 500m 주변 장소 mock (FR-V10). 편의시설/음식점 세그먼트. */
export const mockNearbyPlaces: NearbyPlace[] = [
  {
    id: 'p1',
    segment: 'amenity',
    name: '초록 편의점',
    address: '군산시 초록동 민트로 100',
    photoUrl: 'https://placehold.co/120x120?text=편의점',
    distanceM: 120,
    externalMapUrl: 'https://map.kakao.com/?q=초록%20편의점',
  },
  {
    id: 'p2',
    segment: 'amenity',
    name: '민트 약국',
    address: '군산시 초록동 민트로 88',
    photoUrl: 'https://placehold.co/120x120?text=약국',
    distanceM: 240,
    externalMapUrl: 'https://map.kakao.com/?q=민트%20약국',
  },
  {
    id: 'p3',
    segment: 'restaurant',
    name: '군산 짬뽕집',
    address: '군산시 초록동 민트로 12',
    photoUrl: 'https://placehold.co/120x120?text=짬뽕',
    distanceM: 300,
    externalMapUrl: 'https://map.kakao.com/?q=군산%20짬뽕집',
  },
  {
    id: 'p4',
    segment: 'restaurant',
    name: '초록 분식',
    address: '군산시 초록동 민트로 45',
    photoUrl: 'https://placehold.co/120x120?text=분식',
    distanceM: 460,
    externalMapUrl: 'https://map.kakao.com/?q=초록%20분식',
  },
];
