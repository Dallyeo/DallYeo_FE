import { http, HttpResponse } from 'msw';
import { env } from '@/shared/config/env';
import { mockCourses, mockNearbyPlaces, mockRegions } from './data';

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
];
