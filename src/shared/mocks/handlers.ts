import { http, HttpResponse } from 'msw';
import { env } from '@/shared/config/env';
import {
  buildMockRecordDetail,
  getMockProfile,
  mockAchievements,
  mockCourses,
  mockNearbyPlaces,
  mockRecords,
  mockRegions,
  patchMockProfile,
} from './data';
import type { UserProfilePatch } from '@/domain/types';

const base = env.apiBaseUrl;
/** 공개계 base — 기본은 인증계와 동일(dev 프리뷰 목). 실연동 시 dallyeo.cloud로 분리됨. */
const publicBase = env.publicApiBaseUrl;

/** 백엔드 미준비 엔드포인트 mock (NFR-DATA-01). 준비되면 해당 핸들러 제거로 passthrough. */
export const handlers = [
  // 공개계(regions/courses) — 배포됨. 실연동 전까지 목 유지.
  http.get(`${publicBase}/regions`, () => HttpResponse.json(mockRegions)),
  http.get(`${publicBase}/courses`, ({ request }) => {
    const url = new URL(request.url);
    const region = url.searchParams.get('region');
    const list = region ? mockCourses.filter((c) => c.regionCode === region) : mockCourses;
    // 목록은 **요약** — 상세 전용 필드(경유지/설명)는 제외해 실제 백엔드 계약과 맞춘다.
    return HttpResponse.json(
      list.map(({ waypoints: _w, description: _d, ...summary }) => summary),
    );
  }),
  // 코스 상세 — 경유지(waypointAnchors)·설명은 여기서만 내려온다 (be-api-spec §3.2)
  http.get(`${publicBase}/courses/:courseId`, ({ params }) => {
    const course = mockCourses.find((c) => c.id === String(params.courseId));
    return course
      ? HttpResponse.json(course)
      : HttpResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
  }),
  // V10 완주결과: 주변 장소(500m) + 결과 저장
  http.get(`${base}/runs/:runId/nearby`, () => HttpResponse.json(mockNearbyPlaces)),
  http.post(`${base}/runs`, () => HttpResponse.json({ recordId: 'rec-mock-1' })),
  // V11/V12 기록: 목록 + 상세 (통계 /records/stats 는 MVP3 — 미제공)
  http.get(`${base}/records`, () => HttpResponse.json(mockRecords)),
  http.get(`${base}/records/:recordId`, ({ params }) =>
    HttpResponse.json(buildMockRecordDetail(String(params.recordId))),
  ),
  // V13 설정: 프로필 조회/수정
  http.get(`${base}/me`, () => HttpResponse.json(getMockProfile())),
  http.patch(`${base}/me`, async ({ request }) => {
    const patch = (await request.json()) as UserProfilePatch;
    return HttpResponse.json(patchMockProfile(patch));
  }),
  // V14 업적 (데이터모델 — UI placeholder)
  http.get(`${base}/achievements`, () => HttpResponse.json(mockAchievements)),
];
