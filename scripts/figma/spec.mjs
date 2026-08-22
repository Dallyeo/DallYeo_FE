// 화면 1개의 구조/좌표/색/타이포를 **우리 토큰명으로 번역해** 트리로 출력한다.
// 사용: node scripts/figma/spec.mjs V02_메인 [--depth 6] [--all]
//   --all : 아이콘 내부 벡터까지 전부 (기본은 접음)
import { loadCache } from './fetch.mjs';
import { SCREENS, indexById, pageOf, HIFI_PAGE } from './screens.mjs';
import { loadColorMap, loadTextStyleMap, loadTextMetricMap, toHex } from './tokens.mjs';

const arg = process.argv[2];
const MAXD = Number(process.argv[process.argv.indexOf('--depth') + 1]) || 8;
const ALL = process.argv.includes('--all');

if (!arg) {
  console.log('사용: node scripts/figma/spec.mjs <화면키> [--depth N] [--all]\n');
  console.log('등록된 화면:');
  for (const s of SCREENS) console.log(`  ${s.key.padEnd(24)} ${s.id}`);
  process.exit(0);
}

const screen = SCREENS.find((s) => s.key === arg || s.id === arg);
if (!screen) {
  console.error(`'${arg}' 미등록. 목록은 인자 없이 실행.`);
  process.exit(1);
}

const file = loadCache();
const byId = indexById(file.document);
const styleMeta = file.styles ?? {};
const colorMap = loadColorMap();
const textStyleMap = loadTextStyleMap();
const metricMap = loadTextMetricMap();

const root = byId.get(screen.id);
if (!root) {
  console.error(`캐시에 ${screen.id} 없음. pnpm figma:fetch --force`);
  process.exit(1);
}
const FRAME = root.absoluteBoundingBox;

/** hex → '우리토큰명(#hex)' 또는 미매칭 시 '#hex ⚠️' */
const color = (hex) => {
  const name = colorMap.get(hex.toLowerCase());
  return name ? `${name}` : `${hex}⚠️`;
};

function fillOf(n) {
  const f = (n.fills ?? []).find((x) => x.visible !== false);
  if (!f) return null;
  if (f.type !== 'SOLID') return f.type === 'IMAGE' ? 'IMAGE' : f.type;
  const styleId = n.styles?.fill ?? n.styles?.fills;
  const figmaName = styleId ? styleMeta[styleId]?.name : null;
  const c = color(toHex(f.color));
  const op = f.opacity !== undefined && f.opacity < 1 ? `/${Math.round(f.opacity * 100)}` : '';
  return figmaName ? `${c}${op} «${figmaName}»` : `${c}${op}`;
}

function typoOf(n) {
  if (n.type !== 'TEXT' || !n.style) return null;
  const s = n.style;
  const styleId = n.styles?.text;
  const figmaName = styleId ? styleMeta[styleId]?.name : null;
  const lh = s.lineHeightUnit === 'AUTO' ? 'auto' : Math.round(s.lineHeightPx ?? 0);
  const role =
    (figmaName && textStyleMap.get(figmaName)) ??
    metricMap.get(`${s.fontSize}/${lh}/${s.fontWeight}`) ??
    null;
  const raw = `${s.fontSize}/${lh}/${s.fontWeight}`;
  const fam = (s.fontFamily ?? '').startsWith('SF') ? ' ⚠️SF' : '';
  return role ? `text-${role} (${raw})${fam}` : `⚠️미매칭 ${raw}${fam}${figmaName ? ` «${figmaName}»` : ''}`;
}

const ICONISH = /^(ic[-_]|icon|vector|ellipse|union|subtract|arrow)/i;
const isIcon = (n) =>
  ['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'LINE', 'REGULAR_POLYGON'].includes(n.type) ||
  ICONISH.test(n.name ?? '');

function line(n, depth, parentBox) {
  const b = n.absoluteBoundingBox;
  const pad = '  '.repeat(depth);
  const parts = [];

  if (b) {
    const L = Math.round(b.x - FRAME.x);
    const R = Math.round(FRAME.x + FRAME.width - (b.x + b.width));
    const T = Math.round(b.y - (parentBox ? parentBox.y : FRAME.y));
    parts.push(`${Math.round(b.width)}×${Math.round(b.height)}`);
    parts.push(`L${L} R${R} T${T}`);
    // 좌우 대칭이면 gutter로 표기
    if (L === R && L > 0) parts[parts.length - 1] = `gutter${L} T${T}`;
  }
  const f = fillOf(n);
  if (f) parts.push(f);
  const t = typoOf(n);
  if (t) parts.push(t);
  if (n.cornerRadius) parts.push(`r${n.cornerRadius}`);
  if (n.layoutMode && n.layoutMode !== 'NONE')
    parts.push(`AL:${n.layoutMode === 'VERTICAL' ? 'V' : 'H'} gap${n.itemSpacing ?? 0}`);

  const label =
    n.type === 'TEXT' ? `"${(n.characters ?? '').replace(/\n/g, '⏎').slice(0, 34)}"` : n.name;
  console.log(`${pad}${label}  ·  ${parts.join(' · ')}`);
}

function walk(n, depth, parentBox) {
  if (n.visible === false) return;
  line(n, depth, parentBox);
  if (depth >= MAXD) return;
  if (!ALL && isIcon(n)) return;
  const kids = [...(n.children ?? [])].sort(
    (a, b) =>
      (a.absoluteBoundingBox?.y ?? 0) - (b.absoluteBoundingBox?.y ?? 0) ||
      (a.absoluteBoundingBox?.x ?? 0) - (b.absoluteBoundingBox?.x ?? 0)
  );
  for (const c of kids) walk(c, depth + 1, n.absoluteBoundingBox);
}

// 작업용 페이지의 유사 프레임을 잘못 잡는 사고 방지
const belongsTo = pageOf(file.document).get(screen.id);
if (belongsTo !== HIFI_PAGE) {
  console.log(`\n⚠️⚠️ 이 프레임은 '${belongsTo}' 페이지 소속입니다 — 정본은 '${HIFI_PAGE}' 페이지입니다.`);
  console.log(`   작업용 페이지의 유사 프레임일 수 있으니 반드시 확인하세요.\n`);
}

console.log(`━━ ${screen.key}  (${screen.id})  [${belongsTo}]  프레임 ${Math.round(FRAME.width)}×${Math.round(FRAME.height)}`);
console.log(`   L/R = 프레임 기준 좌우 여백, T = 부모 기준 상단 오프셋\n`);
walk(root, 0, null);
