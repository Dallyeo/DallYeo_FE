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

/** 백엔드 미준비 엔드포인트 mock (NFR-DATA-01). 준비되면 해당 핸들러 제거로 passthrough. */
export const handlers = [
  http.get(`${base}/regions`, () => HttpResponse.json(mockRegions)),
  http.get(`${base}/courses`, ({ request }) => {
    const url = new URL(request.url);
    const regionCode = url.searchParams.get('regionCode');
    const list = regionCode
      ? mockCourses.filter((c) => c.regionCode === regionCode)
      : mockCourses;
    return HttpResponse.json(list);
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
