import { describe, it, expect } from 'vitest';
import { stampSlots, stampShadow } from './achievementStampSlots';

/**
 * 시안 실측 px(402폭, 지도 상자 330×330)를 %로 — 표가 조용히 어긋나면 여기서 잡힌다.
 * 세로 기준은 **본체 이미지 밑단**이다(그룹 높이는 그림자 2.6/4px를 포함해 더 크다).
 */
const pct = (px: number) => (px / 330) * 100;

describe('achievementStampSlots — Figma 실측 배치표', () => {
  it('0개면 아무것도 그리지 않는다 (V12_기록_후_new: 배지도 스탬프도 없음)', () => {
    expect(stampSlots(0)).toEqual([]);
    expect(stampSlots(-1)).toEqual([]);
  });

  it('1개 — V10_결과_new_1: 150×150 한 장이 우하단 모서리에 걸친다', () => {
    expect(stampSlots(1)).toEqual([
      { size: pct(150), right: pct(-15), bottom: pct(-34) },
    ]);
  });

  it('2개 — V10_결과_new_2: 97.4×97.4 두 장', () => {
    expect(stampSlots(2)).toEqual([
      { size: pct(97.4), right: pct(22.6), bottom: pct(76.6) },
      { size: pct(97.4), right: pct(-19.4), bottom: pct(-23.4) },
    ]);
  });

  it('3개 — V10_결과_new_3: 97.4×97.4 세 장', () => {
    expect(stampSlots(3)).toEqual([
      { size: pct(97.4), right: pct(71.6), bottom: pct(31.6) },
      { size: pct(97.4), right: pct(-20.4), bottom: pct(-27.4) },
      { size: pct(97.4), right: pct(-0.4), bottom: pct(96.6) },
    ]);
  });

  /*
   * 개수가 늘면 기존 배지도 **자리를 옮긴다** — 슬롯을 하나씩 덧붙이는 구조가 아니라는 뜻이다.
   * (2개일 때 Group 189는 x246, 3개일 때 x197)
   */
  it('개수가 바뀌면 이미 있던 자리도 함께 바뀐다 (누적 배치가 아니다)', () => {
    expect(stampSlots(2)[0]).not.toEqual(stampSlots(3)[0]);
  });

  it('4개 이상은 시안이 없어 3개 배치를 왼쪽으로 한 벌씩 민다 — 크기는 그대로', () => {
    const many = stampSlots(5);
    expect(many).toHaveLength(5);
    expect(many.every((s) => s.size === pct(97.4))).toBe(true);
    // 4번째 = 3개 배치의 첫 자리에서 한 벌(92) 왼쪽
    expect(many[3]!.right).toBeCloseTo(pct(71.6) + pct(92), 10);
    expect(many[3]!.bottom).toBe(pct(31.6));
    // 자리는 서로 겹치지 않는다
    expect(new Set(many.map((s) => `${s.right},${s.bottom}`)).size).toBe(5);
  });

  it('백엔드가 한 번에 주는 최대치(7개)도 자리를 모두 얻는다', () => {
    expect(stampSlots(7)).toHaveLength(7);
  });

  /** 시안: 같은 이미지를 한 장 더 깔고 opacity 0.2 + blur 4 + 아래로 한 변의 2.667% */
  it('그림자는 크기에 맞춰 오프셋이 달라진다 (150→4px / 97.4→2.6px)', () => {
    expect(stampShadow(pct(150))).toBe('drop-shadow(0 4px 4px rgba(0, 0, 0, 0.2))');
    expect(stampShadow(pct(97.4))).toBe('drop-shadow(0 2.6px 4px rgba(0, 0, 0, 0.2))');
  });
});
