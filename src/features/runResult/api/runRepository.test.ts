import { describe, it, expect, vi, afterEach } from 'vitest';
import { runRepository } from './runRepository';
import type { NearbyPlace, RunResult } from '@/domain/types';

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
    const places: NearbyPlace[] = [
      {
        id: 'p1',
        segment: 'amenity',
        name: '편의점',
        address: '주소',
        distanceM: 120,
        externalMapUrl: 'https://map',
      },
    ];
    stubJson(places);
    const result = await runRepository.listNearbyPlaces('r1');
    expect(result).toEqual(places);
    const [url] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(String(url)).toContain('/runs/r1/nearby');
  });

  it('saveResult는 recordId 반환', async () => {
    stubJson({ recordId: 'rec-1' });
    await expect(runRepository.saveResult(sampleResult)).resolves.toEqual({ recordId: 'rec-1' });
    const [url, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(String(url)).toContain('/runs');
    expect((init as RequestInit).method).toBe('POST');
  });
});
