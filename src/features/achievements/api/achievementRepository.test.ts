import { describe, it, expect, vi, afterEach } from 'vitest';
import { achievementRepository } from './achievementRepository';
import type { Achievement } from '@/domain/types';

afterEach(() => vi.unstubAllGlobals());

describe('achievementRepository (V14)', () => {
  it('list는 /achievements 로 업적 반환', async () => {
    const items: Achievement[] = [{ id: 'a1', title: '경유의 악마', description: '경유지 100개 통과하기' }];
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ status: 200, ok: true, json: async () => items } as Response),
    );
    await expect(achievementRepository.list()).resolves.toEqual(items);
    const [url] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(String(url)).toContain('/achievements');
  });
});
