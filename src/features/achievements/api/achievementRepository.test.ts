import { describe, it, expect, vi, afterEach } from 'vitest';
import { achievementRepository } from './achievementRepository';
import type { Achievement } from '@/domain/types';

afterEach(() => vi.unstubAllGlobals());

describe('achievementRepository (V14)', () => {
  it('list는 /achievements 로 업적 반환', async () => {
    const items: Achievement[] = [{ code: 'JJAMPPONG', name: '짬뽕을 먹을 자격이 있는 자', description: '군산 짬뽕거리 코스', unlocked: true, unlockedAt: '2026-07-09T07:35:10Z' }];
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ status: 200, ok: true, json: async () => items } as Response),
    );
    await expect(achievementRepository.list()).resolves.toEqual(items);
    const [url] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(String(url)).toContain('/achievements');
  });
});
