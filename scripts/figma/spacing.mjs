// 인스코프 화면에서 실측 spacing을 도출한다.
// 이 Figma 파일은 오토레이아웃이 희박(절대배치 위주)하므로 itemSpacing/padding이 아니라
// **형제 노드의 실제 좌표 차이**로 간격을 계산한다.
//  - gutter: 화면 프레임(402) 기준 좌/우 여백
//  - vgap:   세로로 인접한 형제 사이 간격
// 사용: node scripts/figma/spacing.mjs
import { loadCache } from './fetch.mjs';
import { SCREENS, indexById } from './screens.mjs';

const file = loadCache();
const byId = indexById(file.document);

const ICONISH = /^(ic[-_]|icon|vector|ellipse|union|subtract|line \d|arrow)/i;
const isIcon = (n) =>
  ['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'LINE', 'REGULAR_POLYGON'].includes(n.type) ||
  ICONISH.test(n.name ?? '');

const visible = (n) => n.visible !== false && n.absoluteBoundingBox;
const box = (n) => n.absoluteBoundingBox;

const gutterL = new Map();
const gutterR = new Map();
const vgap = new Map();
const radius = new Map();
const width = new Map();
const bump = (m, v, k = 1) => {
  if (v === undefined || v === null) return;
  const r = Math.round(v);
  if (r < 0 || r > 400) return;
  m.set(r, (m.get(r) ?? 0) + k);
};

let scanned = 0;
const missing = [];

function walkContainer(node, frameBox) {
  const kids = (node.children ?? []).filter(visible).filter((n) => !isIcon(n));
  if (kids.length) {
    // 좌우 여백은 화면 프레임 기준으로만 (중첩 컨테이너는 제외 — gutter 의미가 달라짐)
    for (const k of kids) {
      const b = box(k);
      if (node.id === frameBox.id) {
        bump(gutterL, b.x - frameBox.x);
        bump(gutterR, frameBox.x + frameBox.width - (b.x + b.width));
      }
      bump(width, b.width);
    }
    // 세로 인접 형제 간격
    const rows = [...kids].sort((a, b) => box(a).y - box(b).y);
    for (let i = 1; i < rows.length; i++) {
      const prev = box(rows[i - 1]);
      const cur = box(rows[i]);
      const g = cur.y - (prev.y + prev.height);
      // 겹치면(음수) 가로 배치이거나 오버레이 — 제외
      if (g >= 0 && g <= 200) bump(vgap, g);
    }
  }
  for (const c of node.children ?? []) {
    if (isIcon(c)) continue;
    bump(radius, c.cornerRadius);
    walkContainer(c, frameBox);
  }
}

for (const s of SCREENS) {
  const root = byId.get(s.id);
  if (!root) {
    missing.push(s.key);
    continue;
  }
  scanned++;
  const fb = { ...box(root), id: root.id };
  bump(radius, root.cornerRadius);
  walkContainer(root, fb);
}

const report = (title, m, limit = 14) => {
  const rows = [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
  const total = [...m.values()].reduce((s, c) => s + c, 0);
  console.log(`\n━━ ${title}  (고유 ${m.size} / 총 ${total}회)`);
  const max = rows[0]?.[1] ?? 1;
  for (const [v, c] of rows) {
    const bar = '█'.repeat(Math.max(1, Math.round((c / max) * 30)));
    console.log(`  ${String(v).padStart(4)}px ${String(c).padStart(4)}회 ${bar}`);
  }
};

console.log(`스캔: ${scanned}/${SCREENS.length} 화면 (프레임 폭 402 기준)`);
if (missing.length) console.log(`⚠️ 못 찾음: ${missing.join(', ')}`);

report('좌 여백 (gutter-left)', gutterL);
report('우 여백 (gutter-right)', gutterR);
report('세로 간격 (인접 형제)', vgap);
report('요소 폭', width);
report('corner radius', radius, 10);
