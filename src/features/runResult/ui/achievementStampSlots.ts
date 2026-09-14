/**
 * 완주 결과 업적 도장(배지) 배치 — **Figma 실측값 그대로**.
 *
 * 시안 4장에서 읽었다(2026-09-15, `.figma-cache` 원본 노드):
 *   - `V12_기록_후_new` (999:3422)      — 0개: 배지도 초록 스탬프도 **없다**
 *   - `V10_결과_new_1`  (1010:2229)     — 1개: `Group 172` 150×150
 *   - `V10_결과_new_2`  (1024:3354)     — 2개: `Group 189`·`Group 172` 각 97.4×97.4
 *   - `V10_결과_new_3`  (1024:3430)     — 3개: `Group 189`·`Group 172`·`Group 169` 각 97.4×97.4
 *
 * ⚠️ **개수마다 배치가 통째로 다르다.** 2개 → 3개로 갈 때 기존 두 개도 자리를 옮긴다
 * (`Group 189` 246,493 → 197,538). 그래서 "슬롯을 하나씩 추가"하는 식이 아니라
 * **개수별 표**로 둔다.
 *
 * 좌표계 — 시안의 정적 지도 상자(`Mask group 1`, 402폭 기준 x36 y337 **330×330**)를 원점으로 삼고,
 * **오른쪽·아래 모서리 기준 오프셋**을 330으로 나눠 %로 적었다.
 *
 * ⚠️ 기준은 그룹이 아니라 **본체 이미지**다. Figma 그룹 높이는 본체보다 2.6(97.4일 때)·4(150일 때)
 * 크다 — 뒤에 깔린 그림자 복제본이 그만큼 아래로 내려가 있기 때문이다. 그룹 높이로 재면
 * 배지가 전부 그 차이만큼 아래로 내려간다(브라우저 실측으로 확인).
 *   - 화면 폭이 달라도 지도와 함께 비례해 움직인다(우리 지도는 `aspect-square`라 높이=너비).
 *   - 음수는 지도 밖으로 걸쳐 나온다는 뜻이다 — 시안에서 배지는 우하단 모서리에 물려 있다.
 */

export interface StampSlot {
  /** 지도 상자 너비 대비 배지 한 변 (%) */
  size: number;
  /** 지도 오른쪽 모서리에서의 거리 (%). 음수면 바깥으로 나간다 */
  right: number;
  /** 지도 아래 모서리에서의 거리 (%). 음수면 바깥으로 나간다 */
  bottom: number;
}

/** 시안 지도 한 변 — 모든 실측 px를 이 값으로 나눠 %로 바꾼다 */
const MAP = 330;
const pct = (px: number): number => (px / MAP) * 100;

/**
 * 개수별 배치표. 배열 순서 = **그리는 순서**(뒤 → 앞)로 Figma 자식 순서를 그대로 따랐다.
 *
 * 실측 원본(402폭 절대좌표 → 지도 상자 x36..366 / y337..667 기준):
 *   1개  Group 172  x231 y551 150×150   → right -15   bottom -34
 *   2개  Group 189  x246 y493 97.4      → right  22.6 bottom  76.6
 *        Group 172  x288 y593 97.4      → right -19.4 bottom -23.4
 *   3개  Group 189  x197 y538 97.4      → right  71.6 bottom  31.6
 *        Group 172  x289 y597 97.4      → right -20.4 bottom -27.4
 *        Group 169  x269 y473 97.4      → right  -0.4 bottom  96.6
 */
const SLOTS_BY_COUNT: Record<number, StampSlot[]> = {
  1: [{ size: pct(150), right: pct(-15), bottom: pct(-34) }],
  2: [
    { size: pct(97.4), right: pct(22.6), bottom: pct(76.6) },
    { size: pct(97.4), right: pct(-19.4), bottom: pct(-23.4) },
  ],
  3: [
    { size: pct(97.4), right: pct(71.6), bottom: pct(31.6) },
    { size: pct(97.4), right: pct(-20.4), bottom: pct(-27.4) },
    { size: pct(97.4), right: pct(-0.4), bottom: pct(96.6) },
  ],
};

/**
 * 4개 이상은 **시안이 없다**(백엔드는 한 번에 최대 7개까지 준다 — 비로그인 기록을 몰아 올릴 때).
 * 새 모양을 지어내지 않고, 3개 배치를 **왼쪽으로 한 벌씩 밀어** 같은 크기·같은 리듬으로 잇는다.
 * 한 벌의 가로 폭(92 = 71.6 − (−20.4))만큼 밀어 서로 겹치지 않게 한다.
 */
const GROUP_SHIFT = pct(92);

/** 도장 개수 → 배치. 0개면 빈 배열(아무것도 그리지 않는다). */
export function stampSlots(count: number): StampSlot[] {
  if (count <= 0) return [];
  const exact = SLOTS_BY_COUNT[count];
  if (exact) return exact;

  const base = SLOTS_BY_COUNT[3]!;
  return Array.from({ length: count }, (_, i) => {
    const slot = base[i % base.length]!;
    const group = Math.floor(i / base.length);
    return { ...slot, right: slot.right + group * GROUP_SHIFT };
  });
}

/**
 * 배지 그림자 — 시안은 **같은 이미지를 한 장 더** 깔고 `opacity 0.2` + `LAYER_BLUR 4` +
 * 아래로 한 변의 **2.667%**(150→4px, 97.4→2.5974px, 비율 동일)만큼 내려 둔 것이다.
 * 배지 아트가 투명 배경(WebP 450×450)이라 실루엣이 같으므로 `drop-shadow` 한 줄로 같은 그림이 나온다.
 * 오프셋은 시안 절대값(402폭 기준)을 그대로 쓴다 — 기기 폭 차이로 생기는 오차는 0.1px 수준이다.
 */
export function stampShadow(sizePercent: number): string {
  const offset = sizePercent > pct(120) ? 4 : 2.6;
  return `drop-shadow(0 ${offset}px 4px rgba(0, 0, 0, 0.2))`;
}
