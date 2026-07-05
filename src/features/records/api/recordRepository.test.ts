import { describe, it, expect, vi, afterEach } from 'vitest';
import { recordRepository } from './recordRepository';
import type { RunRecord } from '@/domain/types';

afterEach(() => vi.unstubAllGlobals());

function stubJson(body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ status: 200, ok: true, json: async () => body } as Response),
  );
}

describe('recordRepository (V11/V12)', () => {
  it('list는 /records 로 목록 반환', async () => {
    const records: RunRecord[] = [
      {
        id: 'rec1',
        completedAt: '2026-06-10T09:00:00Z',
        distanceKm: 10,
        durationSec: 1930,
        avgPaceSecPerKm: 193,
        calories: 250,
      },
    ];
    stubJson(records);
    await expect(recordRepository.list()).resolves.toEqual(records);
    const [url] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(String(url)).toContain('/records');
  });

  it('getById는 /records/:id 로 상세 요청', async () => {
    stubJson({ id: 'rec2' });
    await recordRepository.getById('rec2');
    const [url] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(String(url)).toContain('/records/rec2');
  });
});
