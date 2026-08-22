// tokens.css / tailwind.config.ts 를 파싱해 Figma 실값 → 우리 토큰명 역매핑을 만든다.
// (하드코딩하지 않으므로 토큰을 고치면 추출 결과도 자동으로 따라간다.)
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from './client.mjs';

/** hex(소문자) → 팔레트 토큰명 (예: '#13c674' → 'green-700') */
export function loadColorMap() {
  const css = readFileSync(resolve(ROOT, 'src/shared/styles/tokens.css'), 'utf8');
  const map = new Map();
  for (const m of css.matchAll(/--c-([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
    const [, name, hex] = m;
    const key = hex.toLowerCase();
    // 먼저 정의된 이름 우선(팔레트 상단이 더 대표적)
    if (!map.has(key)) map.set(key, name);
  }
  return map;
}

/** 'P_SB_17' 같은 Figma 텍스트 스타일명 → 우리 역할 이름 (tailwind.config.ts 주석에서 추출) */
export function loadTextStyleMap() {
  const ts = readFileSync(resolve(ROOT, 'tailwind.config.ts'), 'utf8');
  const map = new Map();
  for (const m of ts.matchAll(/^\s*'?([a-z-]+)'?:\s*\[.*?\],?\s*\/\/\s*([A-Za-z0-9_]+)/gm)) {
    const [, role, figmaName] = m;
    map.set(figmaName, role);
  }
  return map;
}

/** size/weight/lineHeight 조합 → 역할 이름 (스타일 미지정 텍스트용 폴백) */
export function loadTextMetricMap() {
  const ts = readFileSync(resolve(ROOT, 'tailwind.config.ts'), 'utf8');
  const map = new Map();
  for (const m of ts.matchAll(
    /^\s*'?([a-z-]+)'?:\s*\['(\d+)px',\s*\{\s*lineHeight:\s*'(\d+)px'.*?fontWeight:\s*'(\d+)'/gm
  )) {
    const [, role, size, lh, weight] = m;
    map.set(`${size}/${lh}/${weight}`, role);
  }
  return map;
}

export const toHex = (c) =>
  '#' +
  [c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
