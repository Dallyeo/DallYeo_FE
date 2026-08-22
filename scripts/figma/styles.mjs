// published Styles 전량 + 실제 적용값 + 사용처 카운트. 캐시(.figma-cache/file.json) 기반.
// 사용: node scripts/figma/fetch.mjs && node scripts/figma/styles.mjs
import { loadCache } from './fetch.mjs';

const file = loadCache();
const styleMeta = file.styles ?? {};

const toHex = (c) =>
  '#' +
  [c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('') +
  (c.a !== undefined && c.a < 1 ? Math.round(c.a * 255).toString(16).padStart(2, '0') : '');

const textValues = new Map(); // styleId → style object
const fillValues = new Map(); // styleId → hex
const usage = new Map(); // styleId → 사용 노드 수
const bump = (id) => usage.set(id, (usage.get(id) ?? 0) + 1);

function walk(node) {
  const s = node.styles ?? {};
  if (s.text) {
    bump(s.text);
    if (node.style && !textValues.has(s.text)) textValues.set(s.text, node.style);
  }
  for (const key of ['fill', 'fills']) {
    const id = s[key];
    if (!id) continue;
    bump(id);
    if (!fillValues.has(id) && node.fills?.length) {
      const solid = node.fills.find((f) => f.type === 'SOLID' && f.visible !== false);
      if (solid) fillValues.set(id, toHex(solid.color));
    }
  }
  for (const c of node.children ?? []) walk(c);
}
walk(file.document);

const pct = (ls, size) =>
  ls === undefined || ls === 0 ? '0%' : `${((ls / size) * 100).toFixed(0)}%`;

console.log('━━ TEXT 스타일\n');
console.log(
  '이름'.padEnd(16),
  'weight'.padEnd(7),
  'size'.padEnd(5),
  'line'.padEnd(5),
  'letter'.padEnd(7),
  '사용'.padEnd(5),
  'font'
);
console.log('─'.repeat(76));
const texts = Object.entries(styleMeta).filter(([, s]) => s.styleType === 'TEXT');
for (const [id, meta] of texts.sort((a, b) => a[1].name.localeCompare(b[1].name))) {
  const v = textValues.get(id);
  const n = String(usage.get(id) ?? 0);
  if (!v) {
    console.log(meta.name.padEnd(16), '(미사용 — 값 확인 불가)'.padEnd(33), n);
    continue;
  }
  const lh = v.lineHeightUnit === 'AUTO' ? 'auto' : String(Math.round(v.lineHeightPx ?? 0));
  console.log(
    meta.name.padEnd(16),
    String(v.fontWeight ?? '-').padEnd(7),
    String(v.fontSize ?? '-').padEnd(5),
    lh.padEnd(5),
    pct(v.letterSpacing, v.fontSize).padEnd(7),
    n.padEnd(5),
    v.fontFamily ?? '-'
  );
}

console.log('\n━━ FILL 스타일\n');
console.log('이름'.padEnd(22), 'hex'.padEnd(10), '사용');
console.log('─'.repeat(42));
const fills = Object.entries(styleMeta).filter(([, s]) => s.styleType === 'FILL');
for (const [id, meta] of fills.sort((a, b) => a[1].name.localeCompare(b[1].name))) {
  console.log(
    meta.name.padEnd(22),
    (fillValues.get(id) ?? '(미사용)').padEnd(10),
    String(usage.get(id) ?? 0)
  );
}

const others = Object.entries(styleMeta).filter(
  ([, s]) => !['TEXT', 'FILL'].includes(s.styleType)
);
if (others.length) {
  console.log('\n━━ 기타 스타일');
  for (const [, m] of others) console.log(`  ${m.styleType.padEnd(8)} ${m.name}`);
}
console.log(`\n(TEXT ${texts.length} / FILL ${fills.length} / 기타 ${others.length})`);
