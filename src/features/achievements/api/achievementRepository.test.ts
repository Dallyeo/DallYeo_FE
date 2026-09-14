import { describe, it, expect, vi, afterEach } from 'vitest';
import { achievementRepository } from './achievementRepository';

afterEach(() => vi.unstubAllGlobals());

function stubJson(body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ status: 200, ok: true, json: async () => body } as Response),
  );
}

/** `GET /achievements` 응답 항목 (be-api-guide-0914 §8.1) */
const dto = {
  code: 'JJAMPPONG',
  category: 'GUNSAN',
  sortOrder: 30,
  name: '짬뽕을 먹을 자격이 있는 자',
  description: '군산의 짬뽕거리 코스를 완주했다.',
  iconOnUrl: '/images/achievements/jjamppong_on.webp',
  iconOffUrl: '/images/achievements/jjamppong_off.webp',
  unlocked: true,
  unlockedAt: '2026-07-09T07:35:10Z',
};

describe('achievementRepository (V14)', () => {
  it('list는 /achievements 로 요청하고 분류·정렬 필드를 그대로 넘긴다', async () => {
    stubJson([dto]);
    const [item] = await achievementRepository.list();
    expect(String((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![0])).toContain(
      '/achievements',
    );
    expect(item).toMatchObject({
      code: 'JJAMPPONG',
      category: 'GUNSAN',
      sortOrder: 30,
      unlocked: true,
    });
  });

  it('배지 경로(서버 절대경로)에 API base를 붙여 바로 쓸 수 있게 만든다', async () => {
    stubJson([dto]);
    const [item] = await achievementRepository.list();
    expect(item!.iconOnUrl).toMatch(/\/images\/achievements\/jjamppong_on\.webp$/);
    expect(item!.iconOffUrl).toMatch(/\/images\/achievements\/jjamppong_off\.webp$/);
    // 상대경로 그대로면 WebView(로컬 번들)에서 열리지 않는다
    expect(item!.iconOnUrl).not.toBe('/images/achievements/jjamppong_on.webp');
  });

  /*
   * 명세는 "sortOrder 오름차순으로 정렬된 상태로 내려간다"고 하지만, 화면 순서가 서버의
   * 약속 하나에 달려 있으면 조용히 어긋났을 때 알아채기 어렵다 — 받아서 한 번 더 세운다.
   */
  it('sortOrder 오름차순으로 세운다 (서버가 섞어 보내도)', async () => {
    stubJson([
      { ...dto, code: 'PIONEER', category: 'COMMON', sortOrder: 210 },
      { ...dto, code: 'GUNSAN_SEONYUDO', sortOrder: 10 },
      { ...dto, code: 'JJAMPPONG', sortOrder: 30 },
    ]);
    const items = await achievementRepository.list();
    expect(items.map((a) => a.code)).toEqual(['GUNSAN_SEONYUDO', 'JJAMPPONG', 'PIONEER']);
  });
});
