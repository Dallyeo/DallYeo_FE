import { http, HttpResponse } from 'msw';
import { env } from '@/shared/config/env';
import {
  buildMockRunDetail,
  getMockProfile,
  mockAchievements,
  buildMockRuns,
  patchMockProfile,
} from './data';

const base = env.apiBaseUrl;

/** 백엔드 미준비 엔드포인트 mock (NFR-DATA-01). 준비되면 해당 핸들러 제거로 passthrough. */
export const handlers = [
  // 공개계(regions/courses)는 **실 백엔드**(env.publicApiBaseUrl)로 직접 나간다 — 목 없음.
  // V10 완주결과: 주변 장소(500m) + 결과 저장
  // 주변 장소는 **공개계 실 백엔드**(/places/nearby)로 나간다 — 목 없음
  http.post(`${base}/runs`, () => HttpResponse.json({ id: 1 })),
  // V11/V12 기록: 목록 + 상세 (통계 /records/stats 는 MVP3 — 미제공)
  http.get(`${base}/runs`, ({ request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    let runs = buildMockRuns();
    // finishedAt(날짜) 기준 [from, to] 포함 필터 — backend §7.2와 동일 의미.
    // ⚠️ ISO를 `.slice(0,10)`으로 자르면 **UTC 날짜**라 KST 오전 기록이 전날로 밀린다 → 로컬 날짜로 비교.
    const localDate = (iso: string) => {
      const d = new Date(iso);
      const p = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    };
    if (from) runs = runs.filter((r) => localDate(r.finishedAt) >= from);
    if (to) runs = runs.filter((r) => localDate(r.finishedAt) <= to);
    // 최신순
    runs.sort((a, b) => b.finishedAt.localeCompare(a.finishedAt));
    return HttpResponse.json(runs);
  }),
  http.get(`${base}/runs/:recordId`, ({ params }) =>
    HttpResponse.json(buildMockRunDetail(String(params.recordId))),
  ),
  // V13 설정: 프로필 조회/수정
  http.get(`${base}/users/me`, () => HttpResponse.json(getMockProfile())),
  http.patch(`${base}/users/me`, async ({ request }) => {
    const patch = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(patchMockProfile(patch));
  }),
  http.delete(`${base}/users/me`, () => new HttpResponse(null, { status: 204 })),
  // V14 업적 (데이터모델 — UI placeholder)
  http.get(`${base}/achievements`, () => HttpResponse.json(mockAchievements)),
];
