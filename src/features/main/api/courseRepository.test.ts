import { describe, it, expect, vi, afterEach } from 'vitest';
import { courseRepository } from './courseRepository';
import { regionRepository } from './regionRepository';
import type { Course, Region } from '@/domain/types';

afterEach(() => vi.unstubAllGlobals());

function stubJson(body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ status: 200, ok: true, json: async () => body } as Response),
  );
}

describe('courseRepository / regionRepository', () => {
  it('listRecommended는 regionCode 쿼리로 코스 반환', async () => {
    const courses: Course[] = [
      {
        id: 'c1',
        title: 't',
        description: 'd',
        distanceKm: 1,
        estimatedTime: '10분',
        previewImageUrl: 'x',
        regionCode: 'GUNSAN',
      },
    ];
    stubJson(courses);
    const result = await courseRepository.listRecommended('GUNSAN');
    expect(result).toHaveLength(1);
    const [url] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(String(url)).toContain('region=GUNSAN');
  });

  it('listSupported는 지역 목록 반환', async () => {
    const regions: Region[] = [{ code: 'GUNSAN', name: '군산' }];
    stubJson(regions);
    await expect(regionRepository.listSupported()).resolves.toEqual(regions);
  });
});
