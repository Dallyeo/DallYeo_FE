import { describe, it, expect, vi, afterEach } from 'vitest';
import { recordRepository } from './recordRepository';

afterEach(() => vi.unstubAllGlobals());

function stubJson(body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ status: 200, ok: true, json: async () => body } as Response),
  );
}

const calledUrl = () => String((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![0]);

/** 백엔드 목록 응답(backend-api.md §7.2) — 페이스·칼로리 없음 */
const runDto = {
  id: 1,
  courseName: '근대 역사 박물관 런',
  distanceMeters: 10480,
  durationSeconds: 3600,
  finishedAt: '2026-06-10T09:00:00Z',
};

describe('recordRepository (V11/V12)', () => {
  it('list는 /runs 로 요청하고 백엔드 필드를 도메인으로 매핑한다', async () => {
    stubJson([runDto]);
    const [record] = await recordRepository.list();
    expect(calledUrl()).toContain('/runs');
    expect(record).toMatchObject({
      id: '1',
      completedAt: '2026-06-10T09:00:00Z',
      distanceKm: 10.48,
      durationSec: 3600,
      courseName: '근대 역사 박물관 런',
    });
  });

  it('목록에 페이스가 없으면 거리·시간으로 계산한다', async () => {
    stubJson([runDto]);
    const [record] = await recordRepository.list();
    // 3600초 / 10.48km ≈ 344초/km
    expect(record!.avgPaceSecPerKm).toBe(Math.round(3600 / 10.48));
  });

  it('칼로리는 명세에 없어 응답에 없으면 undefined로 둔다', async () => {
    stubJson([runDto]);
    const [record] = await recordRepository.list();
    expect(record!.calories).toBeUndefined();
  });

  it('range를 주면 from/to 쿼리로 전달한다', async () => {
    stubJson([]);
    await recordRepository.list({ from: '2026-06-15', to: '2026-06-21' });
    expect(calledUrl()).toContain('from=2026-06-15');
    expect(calledUrl()).toContain('to=2026-06-21');
  });

  it('getById는 /runs/:id 로 요청하고 polyline을 매핑한다', async () => {
    stubJson({ ...runDto, polyline: [{ lat: 35.9, lng: 126.7 }], completionRate: 100 });
    const detail = await recordRepository.getById('1');
    expect(calledUrl()).toContain('/runs/1');
    expect(detail.routePolyline).toHaveLength(1);
    expect(detail.completionRate).toBe(100);
  });
});
