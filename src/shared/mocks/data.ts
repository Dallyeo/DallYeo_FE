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

/** 지원 지역: 군산(기본) + 전주 (be-api-spec-recieved-sprint4.md §2) */
export const mockRegions: Region[] = [
  { code: DEFAULT_REGION_CODE, name: '군산' },
  { code: 'JEONJU', name: '전주' },
];

export const mockCourses: Course[] = [
  {
    id: 'c1',
    title: '군산 원도심 근대문화 코스',
    description: '근대 건축물을 따라 달리는 평지 코스.',
    distanceKm: 4.2,
    estimatedTime: '약 30분',
    previewImageUrl: 'https://placehold.co/600x300?text=Course+1',
    regionCode: DEFAULT_REGION_CODE,
    distanceCategory: 'MEDIUM',
    waypoints: ['군산 근대역사박물관', '초원사진관', '경암동 철길마을'],
  },
  {
    id: 'c2',
    title: '은파호수공원 둘레길',
    description: '호수를 한 바퀴 도는 완만한 코스.',
    distanceKm: 6.0,
    estimatedTime: '약 45분',
    previewImageUrl: 'https://placehold.co/600x300?text=Course+2',
    regionCode: DEFAULT_REGION_CODE,
    distanceCategory: 'MEDIUM',
    waypoints: ['은파호수 공원', '은파호수 둘레길', '물빛다리'],
  },
  {
    id: 'c3',
    title: '한옥마을 둘레길 코스',
    description: '전주 한옥마을을 도는 짧은 코스.',
    distanceKm: 2.8,
    estimatedTime: '약 20분',
    previewImageUrl: 'https://placehold.co/600x300?text=Course+3',
    regionCode: 'JEONJU',
    distanceCategory: 'SHORT',
    waypoints: ['전동성당', '경기전', '오목대'],
  },
];

/** 완주 위치 500m 주변 장소 mock (FR-V10). 편의시설/음식점 세그먼트. */
export const mockNearbyPlaces: NearbyPlace[] = [
  // 스크롤 확인용 — 세그먼트별 6건씩(사진 없음 케이스 각 1건 포함)
  {
    id: 'p1',
    segment: 'restaurant',
    name: '군산 짬뽕집',
    address: '군산시 초록동 민트로 12',
    photoUrl: 'https://placehold.co/370x140?text=군산 짬뽕집',
    category: '중식',
    businessHours: '11:00-21:00',
    isOpenNow: true,
    phoneNumber: '063-000-0001',
    distanceM: 120,
    externalMapUrl: 'https://map.kakao.com/?q=군산 짬뽕집',
  },
  {
    id: 'p2',
    segment: 'restaurant',
    name: '치로치로월명',
    address: '군산시 열월동 감자 16-2',
    photoUrl: 'https://placehold.co/370x140?text=치로치로월명',
    category: '디저트',
    businessHours: '10:00-22:00',
    isOpenNow: true,
    phoneNumber: '063-000-0002',
    distanceM: 180,
    externalMapUrl: 'https://map.kakao.com/?q=치로치로월명',
  },
  {
    id: 'p3',
    segment: 'restaurant',
    name: '고구마 사랑단',
    address: '군산시 열월동 고구마 16-2',
    photoUrl: 'https://placehold.co/370x140?text=고구마 사랑단',
    category: '분식',
    businessHours: '09:00-20:00',
    isOpenNow: false,
    phoneNumber: '063-000-0003',
    distanceM: 240,
    externalMapUrl: 'https://map.kakao.com/?q=고구마 사랑단',
  },
  {
    id: 'p4',
    segment: 'restaurant',
    name: '이성당 본점',
    address: '군산시 중앙로 177',
    photoUrl: 'https://placehold.co/370x140?text=이성당 본점',
    category: '베이커리',
    businessHours: '08:00-22:00',
    isOpenNow: true,
    phoneNumber: '063-000-0004',
    distanceM: 310,
    externalMapUrl: 'https://map.kakao.com/?q=이성당 본점',
  },
  {
    id: 'p5',
    segment: 'restaurant',
    name: '한일옥',
    address: '군산시 구영3길 63',
    photoUrl: 'https://placehold.co/370x140?text=한일옥',
    category: '한식',
    businessHours: '10:00-20:00',
    isOpenNow: true,
    distanceM: 380,
    externalMapUrl: 'https://map.kakao.com/?q=한일옥',
  },
  {
    id: 'p6',
    segment: 'restaurant',
    name: '초원분식',
    address: '군산시 초록동 민트로 45',
    category: '분식',
    businessHours: '11:00-19:00',
    isOpenNow: false,
    phoneNumber: '063-000-0006',
    distanceM: 450,
    externalMapUrl: 'https://map.kakao.com/?q=초원분식',
  },
  {
    id: 'p7',
    segment: 'amenity',
    name: '초록 편의점',
    address: '군산시 초록동 민트로 100',
    photoUrl: 'https://placehold.co/370x140?text=초록 편의점',
    category: '편의점',
    businessHours: '00:00-24:00',
    isOpenNow: true,
    phoneNumber: '063-000-0007',
    distanceM: 90,
    externalMapUrl: 'https://map.kakao.com/?q=초록 편의점',
  },
  {
    id: 'p8',
    segment: 'amenity',
    name: '민트 약국',
    address: '군산시 초록동 민트로 88',
    photoUrl: 'https://placehold.co/370x140?text=민트 약국',
    category: '약국',
    businessHours: '09:00-21:00',
    isOpenNow: false,
    phoneNumber: '063-000-0008',
    distanceM: 150,
    externalMapUrl: 'https://map.kakao.com/?q=민트 약국',
  },
  {
    id: 'p9',
    segment: 'amenity',
    name: '월명공원 화장실',
    address: '군산시 월명동 산 1-1',
    photoUrl: 'https://placehold.co/370x140?text=월명공원 화장실',
    category: '화장실',
    businessHours: '05:00-23:00',
    isOpenNow: true,
    distanceM: 210,
    externalMapUrl: 'https://map.kakao.com/?q=월명공원 화장실',
  },
  {
    id: 'p10',
    segment: 'amenity',
    name: '근대역사 주차장',
    address: '군산시 해망로 240',
    photoUrl: 'https://placehold.co/370x140?text=근대역사 주차장',
    category: '주차장',
    businessHours: '00:00-24:00',
    isOpenNow: true,
    phoneNumber: '063-000-0010',
    distanceM: 290,
    externalMapUrl: 'https://map.kakao.com/?q=근대역사 주차장',
  },
  {
    id: 'p11',
    segment: 'amenity',
    name: '시민 물품보관함',
    address: '군산시 중앙로 12',
    category: '보관함',
    businessHours: '06:00-22:00',
    isOpenNow: true,
    distanceM: 360,
    externalMapUrl: 'https://map.kakao.com/?q=시민 물품보관함',
  },
  {
    id: 'p12',
    segment: 'amenity',
    name: '나운 자전거대여소',
    address: '군산시 나운동 은파로 3',
    photoUrl: 'https://placehold.co/370x140?text=나운 자전거대여소',
    category: '대여소',
    businessHours: '09:00-18:00',
    isOpenNow: false,
    phoneNumber: '063-000-0012',
    distanceM: 470,
    externalMapUrl: 'https://map.kakao.com/?q=나운 자전거대여소',
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
