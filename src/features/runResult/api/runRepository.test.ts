import { describe, it, expect, vi, afterEach } from 'vitest';
import { runRepository } from './runRepository';
import type { RunResult } from '@/domain/types';

afterEach(() => vi.unstubAllGlobals());

function stubJson(body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ status: 200, ok: true, json: async () => body } as Response),
  );
}

const sampleResult: RunResult = {
  runId: 'r1',
  distanceKm: 10.23,
  durationSec: 3600,
  avgPaceSecPerKm: 495,
  calories: 200,
  completionRate: 100,
  routePolyline: [],
  staticMapImageUrl: 'https://example.com/map.png',
  endLocation: { lat: 35.9, lng: 126.7 },
  completedAt: '2026-07-05T00:00:00Z',
};

describe('runRepository (V10)', () => {
  it('listNearbyPlaces는 runId 경로로 주변장소 반환', async () => {
    stubJson([
      {
        id: 'p1',
        name: '편의점',
        category: 'ETC',
        latitude: 35.9,
        longitude: 126.7,
        address: '주소',
        distanceMeters: 120,
      },
    ]);
    const result = await runRepository.listNearbyPlaces({ lat: 35.9, lng: 126.7 });
    expect(result[0]).toMatchObject({ id: 'p1', segment: 'amenity', distanceM: 120 });
    const [url] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(String(url)).toContain('/places/nearby?lat=35.9&lng=126.7&radius=500');
  });

  it('saveResult는 recordId 반환', async () => {
    stubJson({ id: 42 });
    await expect(runRepository.saveResult(sampleResult)).resolves.toEqual({ recordId: '42' });
    const [url, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(String(url)).toContain('/runs');
    expect((init as RequestInit).method).toBe('POST');
  });
});
