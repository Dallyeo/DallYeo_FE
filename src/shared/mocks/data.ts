import type {
  Achievement,
  Course,
  NearbyPlace,
  Region,
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
/**
 * 러닝 기록 목(backend-api.md §7 형태). `finishedAt`은 조회 시점 기준으로 생성해
 * 주간/월간/연간 탭이 항상 데이터를 갖도록 한다(daysAgo = 며칠 전).
 * ⚠️ `calories`는 백엔드 명세에 없는 필드 — 목에서만 채운다.
 */
export const mockRunSeeds = [
  // ── 이번 주(일~토) 채우기용 — 주가 바뀌어도 항상 이번 주에 걸리도록 **주 시작일 기준 오프셋**을 쓴다.
  //    daysAgo만 쓰면 오늘이 일요일일 때 나머지가 전부 지난주로 밀려 그래프가 비어 보인다.
  { id: 101, courseId: 'c1', courseName: '선유도 해변 런', distanceMeters: 5181, durationSeconds: 1860, averagePaceSeconds: 359, calories: 128, fromWeekStart: 0 },
  { id: 102, courseId: null, courseName: null, distanceMeters: 7300, durationSeconds: 2640, averagePaceSeconds: 362, calories: 182, fromWeekStart: 1 },
  { id: 103, courseId: 'c2', courseName: '짬뽕런', distanceMeters: 5894, durationSeconds: 2100, averagePaceSeconds: 356, calories: 147, fromWeekStart: 2 },
  { id: 104, courseId: null, courseName: null, distanceMeters: 11200, durationSeconds: 4020, averagePaceSeconds: 359, calories: 280, fromWeekStart: 3 },
  { id: 105, courseId: 'c1', courseName: '은파호수 둘레길', distanceMeters: 3400, durationSeconds: 1260, averagePaceSeconds: 371, calories: 85, fromWeekStart: 5 },

  {
    id: 1,
    courseId: 'c1',
    courseName: '근대 역사 박물관 런',
    distanceMeters: 10230,
    durationSeconds: 3660,
    averagePaceSeconds: 358,
    calories: 250,
    daysAgo: 0,
  },
  {
    id: 2,
    courseId: null,
    courseName: null,
    distanceMeters: 6100,
    durationSeconds: 2280,
    averagePaceSeconds: 374,
    calories: 150,
    daysAgo: 1,
  },
  {
    id: 3,
    courseId: 'c1',
    courseName: '은파호수 둘레길',
    distanceMeters: 4050,
    durationSeconds: 1560,
    averagePaceSeconds: 385,
    calories: 100,
    daysAgo: 2,
  },
  {
    id: 4,
    courseId: null,
    courseName: null,
    distanceMeters: 8400,
    durationSeconds: 3120,
    averagePaceSeconds: 371,
    calories: 205,
    daysAgo: 3,
  },
  {
    id: 5,
    courseId: 'c1',
    courseName: '초원사진관 코스',
    distanceMeters: 2200,
    durationSeconds: 900,
    averagePaceSeconds: 409,
    calories: 55,
    daysAgo: 4,
  },
  {
    id: 6,
    courseId: 'c1',
    courseName: '군산 원도심 코스',
    distanceMeters: 12000,
    durationSeconds: 4440,
    averagePaceSeconds: 370,
    calories: 300,
    daysAgo: 5,
  },
  {
    id: 7,
    courseId: null,
    courseName: null,
    distanceMeters: 5300,
    durationSeconds: 1980,
    averagePaceSeconds: 374,
    calories: 130,
    daysAgo: 6,
  },
  {
    id: 8,
    courseId: 'c1',
    courseName: '은파호수 둘레길',
    distanceMeters: 7750,
    durationSeconds: 2820,
    averagePaceSeconds: 364,
    calories: 190,
    daysAgo: 9,
  },
  {
    id: 9,
    courseId: null,
    courseName: null,
    distanceMeters: 3600,
    durationSeconds: 1380,
    averagePaceSeconds: 383,
    calories: 88,
    daysAgo: 12,
  },
  {
    id: 10,
    courseId: 'c1',
    courseName: '근대 역사 박물관 런',
    distanceMeters: 9100,
    durationSeconds: 3360,
    averagePaceSeconds: 369,
    calories: 225,
    daysAgo: 16,
  },
  {
    id: 11,
    courseId: 'c1',
    courseName: '장자도 코스',
    distanceMeters: 15200,
    durationSeconds: 5700,
    averagePaceSeconds: 375,
    calories: 380,
    daysAgo: 21,
  },
  {
    id: 12,
    courseId: null,
    courseName: null,
    distanceMeters: 4800,
    durationSeconds: 1800,
    averagePaceSeconds: 375,
    calories: 118,
    daysAgo: 28,
  },
  {
    id: 13,
    courseId: 'c1',
    courseName: '군산 원도심 코스',
    distanceMeters: 11000,
    durationSeconds: 4080,
    averagePaceSeconds: 371,
    calories: 275,
    daysAgo: 40,
  },
  {
    id: 14,
    courseId: null,
    courseName: null,
    distanceMeters: 6600,
    durationSeconds: 2460,
    averagePaceSeconds: 373,
    calories: 162,
    daysAgo: 55,
  },
];

/** daysAgo → 실제 ISO 시각으로 변환한 목 응답 (목록/상세 공용) */
export function buildMockRuns() {
  const now = new Date();
  // 이번 주 시작(일요일) 00:00
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  return mockRunSeeds.map(({ daysAgo, fromWeekStart, durationSeconds, ...rest }) => {
    const finished =
      fromWeekStart !== undefined
        ? new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + fromWeekStart)
        : new Date(now.getTime() - (daysAgo ?? 0) * 86400000);
    finished.setHours(8, 30, 0, 0);
    const started = new Date(finished.getTime() - durationSeconds * 1000);
    return {
      ...rest,
      durationSeconds,
      startedAt: started.toISOString(),
      finishedAt: finished.toISOString(),
    };
  });
}


/** 기록 상세 mock (V12) — backend §7.3 형태(목록 + polyline). */
export function buildMockRunDetail(recordId: string) {
  const runs = buildMockRuns();
  const base = runs.find((r) => String(r.id) === recordId) ?? runs[0]!;
  return {
    ...base,
    completionRate: 100,
    // 지정 코스면 코스 지점명, 자유 러닝이면 출발지 미상 → 뷰가 "지정된 위치"로 표기
    ...(base.courseName
      ? { startPlaceName: '청송 과수원', endPlaceName: '신시 전망대' }
      : { endPlaceName: '신시 전망대' }),
    polyline: [
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
/** 업적 목 — backend-api.md §8.1 고정 8종 */
export const mockAchievements: Achievement[] = [
  {
    code: 'GUNSAN_BEGINNER',
    name: '군산 초보 러너',
    description: '군산에서 러닝 1회 완료',
    unlocked: true,
    unlockedAt: '2026-06-12T09:00:00Z',
  },
  {
    code: 'JJAMPPONG',
    name: '짬뽕을 먹을 자격이 있는 자',
    description: '군산 짬뽕거리 코스를 완주한 사람',
    unlocked: true,
    unlockedAt: '2026-07-09T07:35:10Z',
  },
  {
    code: 'GUNSAN_CONQUEROR',
    name: '군산 런트립 정복자',
    description: '군산의 모든 추천 코스를 완주한 사람',
    unlocked: false,
    unlockedAt: null,
  },
  {
    code: 'NATURE_LOVER',
    name: '자연을 사랑해!',
    description: '군산 편백나무 숲 코스를 완주한 사람',
    unlocked: true,
    unlockedAt: '2026-08-01T10:12:00Z',
  },
  {
    code: 'BETWEEN_WAVES',
    name: '부숴지는 파도를 사이에서',
    description: '군산 새만금 방파제 코스를 완주한 사람',
    unlocked: false,
    unlockedAt: null,
  },
  {
    code: 'JEONJU_BEGINNER',
    name: '전주 초보 러너',
    description: '전주에서 러닝 1회 완료',
    unlocked: true,
    unlockedAt: '2026-07-20T08:30:00Z',
  },
  {
    code: 'JEONJU_CONQUEROR',
    name: '전주 런트립 정복자',
    description: '전주의 모든 추천 코스를 완주한 사람',
    unlocked: false,
    unlockedAt: null,
  },
  {
    code: 'JEONJU_PILGRIM',
    name: '전주 성지순례자',
    description: '전주 천주교 성지 코스를 완주한 사람',
    unlocked: false,
    unlockedAt: null,
  },
];
