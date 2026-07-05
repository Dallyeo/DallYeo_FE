import type {
  Achievement,
  Course,
  NearbyPlace,
  Region,
  RunRecord,
  RunRecordDetail,
  UserProfile,
  UserProfilePatch,
} from '@/domain/types';
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

/** 기록 목록 mock (V11). 최신순. */
export const mockRecords: RunRecord[] = [
  {
    id: 'rec1',
    completedAt: '2026-06-10T09:00:00Z',
    distanceKm: 10,
    durationSec: 1930,
    avgPaceSecPerKm: 193,
    calories: 250,
  },
  {
    id: 'rec2',
    completedAt: '2026-06-06T08:30:00Z',
    distanceKm: 10.23,
    durationSec: 5064,
    avgPaceSecPerKm: 495,
    calories: 200,
  },
  {
    id: 'rec3',
    completedAt: '2026-05-30T07:00:00Z',
    distanceKm: 5.4,
    durationSec: 2160,
    avgPaceSecPerKm: 400,
    calories: 130,
  },
];

/** 기록 상세 mock (V12). 목록 항목 + 경로/정적지도 보강. */
export function buildMockRecordDetail(recordId: string): RunRecordDetail {
  const base = mockRecords.find((r) => r.id === recordId) ?? mockRecords[0]!;
  return {
    ...base,
    id: recordId,
    completionRate: 100,
    routePolyline: [
      { lat: 35.9678, lng: 126.7369 },
      { lat: 35.9701, lng: 126.7402 },
    ],
    staticMapImageUrl: 'https://placehold.co/600x450?text=Record+Route',
  };
}

/** 프로필 mock (V13). PATCH 반영을 위해 모듈 스코프 상태로 보관. */
let profile: UserProfile = {
  nickname: '카야',
  heightCm: 167.5,
  weightKg: 55,
  gender: 'unspecified',
};

export function getMockProfile(): UserProfile {
  return profile;
}

export function patchMockProfile(patch: UserProfilePatch): UserProfile {
  profile = { ...profile, ...patch };
  return profile;
}

/** 업적 mock (V14 — 데이터모델 검증용). UI는 placeholder. */
export const mockAchievements: Achievement[] = [
  {
    id: 'a1',
    title: '경유의 악마',
    description: '경유지 100개 통과하기',
    achievedAt: '2026-06-12T00:00:00Z',
  },
  {
    id: 'a2',
    title: '먹으려고 뛰는 사람',
    description: '맛집 100개 추천 받기',
    achievedAt: '2026-05-13T00:00:00Z',
  },
  { id: 'a3', title: '인간 자동차', description: '누적 100km 달리기' },
];
