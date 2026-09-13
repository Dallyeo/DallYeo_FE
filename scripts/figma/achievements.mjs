// 업적(V14) 배지 이미지 + 메타데이터 추출 → 백엔드 테이블 시딩용 산출물 생성.
//
// 소스: HiFi 페이지
//   - Section 3 (999:3418) = **ON**  (획득 / 컬러)
//   - Section 4 (999:3419) = **OFF** (미획득 / 동일 이미지 + saturation:-1 흑백)
//   두 섹션은 카드 프레임 이름(예: "Frame 378")으로 1:1 대응한다. 이름이 매칭 키다.
//
// 사용: node scripts/figma/achievements.mjs            (표만 출력 + 매칭 검증)
//       node scripts/figma/achievements.mjs --write    (WebP + CSV + JSON 저장)
//       node scripts/figma/achievements.mjs --write --png      (원본 PNG도 같이 저장)
//       node scripts/figma/achievements.mjs --write --scale 4  (600×600)
//       node scripts/figma/achievements.mjs --write --quality 90
//
// Figma Images API는 png/jpg/svg/pdf만 내려주므로 PNG로 받아 sharp로 WebP 변환한다.
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { figmaGet, FILE_KEY, ROOT } from './client.mjs';
import { loadCache } from './fetch.mjs';
import { indexById, pageOf, HIFI_PAGE } from './screens.mjs';

const SECTION_ON = '999:3418';
const SECTION_OFF = '999:3419';
const OUT_DIR = resolve(ROOT, 'export/achievements');
const IMG_DIR = resolve(OUT_DIR, 'images');

const write = process.argv.includes('--write');
const keepPng = process.argv.includes('--png');
const numArg = (flag, fallback) => {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? Number(process.argv[i + 1]) : fallback;
};
const SCALE = numArg('--scale', 3); // 150pt 카드 → @3x = 450px
const QUALITY = numArg('--quality', 85); // WebP 손실 품질 (알파 보존)

/**
 * 업적 레지스트리 — **코드가 곧 백엔드 PK**라서 손으로 고정한다.
 * key = Figma 카드 프레임 이름(두 섹션 공통). 자동 생성하면 시안 수정 시 코드가 흔들린다.
 *
 * `code` 8종(GUNSAN_BEGINNER·JJAMPPONG·GUNSAN_CONQUEROR·NATURE_LOVER·BETWEEN_WAVES·
 * JEONJU_BEGINNER·JEONJU_CONQUEROR·JEONJU_PILGRIM)은 docs/backend/backend-api.md §8.1의
 * 기존 계약과 동일하게 유지했다. 나머지 13종이 이번에 추가되는 신규 코드.
 *
 * condition = 백엔드 판정 조건. 시안 설명문이 모호한 항목은 `todo: true`로 표시한다.
 */
const REGISTRY = {
  // ── 전주 (Section 3 / Frame 387) ──
  'Frame 378': {
    code: 'JEONJU_CHERRY_BLOSSOM',
    category: 'JEONJU',
    condition: '전주 삼천변 벚꽃길 코스 완주',
  },
  'Frame 375': {
    code: 'JEONJU_BEGINNER',
    category: 'JEONJU',
    condition: '전주 지역 런트립 1회 완주',
  },
  'Frame 384': {
    code: 'JEONJU_DEOKJIN_LAKE',
    category: 'JEONJU',
    condition: '전주 덕진호수 코스 완주',
  },
  'Frame 383': {
    code: 'JEONJU_CONQUEROR',
    category: 'JEONJU',
    condition: '전주 추천 코스 전체 완주',
  },
  'Frame 386': {
    code: 'JEONJU_PILGRIM',
    category: 'JEONJU',
    condition: '전주 천주교 성지 코스 완주',
  },
  'Frame 385': {
    code: 'JEONJU_ECO_MUSEUM',
    category: 'JEONJU',
    condition: '전주 자연생태관 코스 완주',
  },

  // ── 군산 (Section 3 / Frame 388) ──
  'Frame 368': {
    code: 'GUNSAN_SEONYUDO',
    category: 'GUNSAN',
    condition: '군산 선유도 해변 코스 완주',
  },
  'Frame 367': {
    code: 'GUNSAN_CONQUEROR',
    category: 'GUNSAN',
    condition: '군산 추천 코스 전체 완주',
  },
  'Frame 374': { code: 'JJAMPPONG', category: 'GUNSAN', condition: '군산 짬뽕거리 코스 완주' },
  'Frame 371': {
    code: 'GUNSAN_BEGINNER',
    category: 'GUNSAN',
    condition: '군산 지역 런트립 1회 완주',
  },
  'Frame 370': {
    code: 'NATURE_LOVER',
    category: 'GUNSAN',
    condition: '군산 편백나무 숲 코스 완주',
  },
  'Frame 377': {
    code: 'BETWEEN_WAVES',
    category: 'GUNSAN',
    condition: '군산 새만금 방파제 코스 완주',
  },

  // ── 공통 (Section 3 / Frame 389) — 지역 무관 ──
  'Frame 369': {
    code: 'LONG_RUN_3H',
    category: 'COMMON',
    condition: '단일 런트립 러닝 시간 ≥ 3시간',
  },
  'Frame 381': { code: 'FINISH_10', category: 'COMMON', condition: '누적 완주 횟수 ≥ 10회' },
  'Frame 373': {
    code: 'ICE_CREAM_RUNNER',
    category: 'COMMON',
    condition: '12월(로컬 시각 기준) 런트립 1회 완주',
  },
  'Frame 380': { code: 'DISTANCE_100KM', category: 'COMMON', condition: '누적 러닝 거리 ≥ 100km' },
  'Frame 366': {
    code: 'EARLY_BIRD',
    category: 'COMMON',
    condition: '런트립 시작 시각 < 08:00 (로컬)',
  },
  'Frame 376': { code: 'WAYPOINT_3', category: 'COMMON', condition: '경유지 3개 이상 코스 완주' },
  'Frame 372': {
    code: 'REST_TIME',
    category: 'COMMON',
    condition: '도착지 카테고리가 카페/음식점인 코스 완주',
  },
  'Frame 382': {
    code: 'SLOW_WALKER',
    category: 'COMMON',
    condition: '완주 평균 페이스 ≥ 10분/km (기준값 기획 확정 필요)',
    todo: true,
  },
  'Frame 379': { code: 'PIONEER', category: 'COMMON', condition: '직접 만든 코스로 런트립 완주' },
};

/** 시안 텍스트 오타 보정 — 좌: 원문, 우: 배포 문구 */
const TEXT_FIX = { '졍유지 3개 거치고 완주': '경유지 3개 거치고 완주' };

const file = loadCache();
const byId = indexById(file.document);
const pages = pageOf(file.document);

/** 섹션 → [{frameName, imageNodeId, name, description}] */
function readSection(sectionId, kind) {
  const sec = byId.get(sectionId);
  if (!sec) throw new Error(`섹션 ${sectionId} 캐시에 없음. fetch.mjs --force 먼저 실행.`);
  if (pages.get(sectionId) !== HIFI_PAGE)
    console.warn(`⚠️ ${sectionId}가 ${HIFI_PAGE} 페이지가 아님 (${pages.get(sectionId)})`);

  const out = new Map();
  for (const frame of sec.children ?? []) {
    for (const card of frame.children ?? []) {
      // 섹션에는 배지 그리드 외 프레임(V10_결과 시안 등)도 섞여 있다 → 레지스트리에 등록된 카드만 취한다.
      if (!REGISTRY[card.name]) continue;
      if (out.has(card.name))
        throw new Error(`${kind} 카드 이름 중복: "${card.name}" (${card.id})`);
      const texts = [];
      const imgs = [];
      (function walk(n) {
        if (n.type === 'TEXT') texts.push(n.characters.replace(/\s+/g, ' ').trim());
        for (const f of n.fills ?? []) {
          if (f.type !== 'IMAGE') continue;
          // ON 카드는 [뒤: 블러 그림자 복제, 앞: 실제] 2장 → 그림자(LAYER_BLUR)는 버린다.
          const blurred = (n.effects ?? []).some(
            (e) => e.type === 'LAYER_BLUR' && e.visible !== false,
          );
          if (!blurred) imgs.push({ id: n.id, ref: f.imageRef });
        }
        for (const c of n.children ?? []) walk(c);
      })(card);

      if (imgs.length !== 1)
        throw new Error(
          `${kind} ${card.id}(${card.name}) 이미지 레이어 ${imgs.length}장 — 1장이어야 함`,
        );
      out.set(card.name, {
        frameName: card.name,
        cardId: card.id,
        imageNodeId: imgs[0].id,
        imageRef: imgs[0].ref,
        name: texts[0] ?? '',
        description: TEXT_FIX[texts[1]] ?? texts[1] ?? '',
      });
    }
  }
  return out;
}

const on = readSection(SECTION_ON, 'ON');
const off = readSection(SECTION_OFF, 'OFF');

// ── 검증: 개수 / 짝 / imageRef 동일성 / 레지스트리 누락 ──
const problems = [];
if (on.size !== off.size) problems.push(`ON ${on.size}종 ≠ OFF ${off.size}종`);
for (const key of on.keys()) {
  if (!off.has(key)) problems.push(`OFF에 "${key}" 없음`);
  else if (on.get(key).imageRef !== off.get(key).imageRef)
    problems.push(`"${key}" imageRef 불일치 — 같은 원본이어야 함 (ON/OFF는 필터만 다름)`);
  if (!REGISTRY[key]) problems.push(`REGISTRY에 "${key}" 코드 미등록`);
}
for (const key of Object.keys(REGISTRY))
  if (!on.has(key)) problems.push(`REGISTRY의 "${key}"가 시안에 없음`);

const codes = new Set();
const rows = [];
const nodeIds = new Map(); // code → { on, off } 렌더용 Figma 노드 id
const todoCodes = new Set(); // 판정 기준이 아직 기획 미확정인 업적 (콘솔 경고용)
let order = 0;
for (const [key, o] of on) {
  const meta = REGISTRY[key];
  if (!meta) continue;
  if (codes.has(meta.code)) problems.push(`코드 중복: ${meta.code}`);
  codes.add(meta.code);
  const f = off.get(key);
  const slug = meta.code.toLowerCase();
  rows.push({
    code: meta.code,
    category: meta.category,
    sortOrder: ++order * 10,
    name: o.name,
    description: o.description,
    unlockCondition: meta.condition,
    iconOn: `${slug}_on.webp`,
    iconOff: `${slug}_off.webp`,
  });
  // 노드 id는 렌더할 때만 쓰고 산출물에는 넣지 않는다 — 시안 수정 시 바뀌는 값이고,
  // 배지 ↔ code 매칭은 위 REGISTRY(프레임 이름 기준)가 담당한다.
  nodeIds.set(meta.code, { on: o.imageNodeId, off: f?.imageNodeId });
  if (meta.todo) todoCodes.add(meta.code);
}
// 카테고리 → 이름 순으로 정렬해 sortOrder 재부여 (백엔드 목록 기본 정렬)
const CAT_ORDER = { GUNSAN: 0, JEONJU: 1, COMMON: 2 };
rows.sort((a, b) => CAT_ORDER[a.category] - CAT_ORDER[b.category] || a.sortOrder - b.sortOrder);
rows.forEach((r, i) => (r.sortOrder = (i + 1) * 10));

console.log(`업적 ${rows.length}종 (ON/OFF 각 ${rows.length}장 = ${rows.length * 2}개 이미지)\n`);
console.log('code'.padEnd(24), 'cat'.padEnd(8), 'name'.padEnd(26), 'description');
console.log('─'.repeat(110));
for (const r of rows)
  console.log(
    r.code.padEnd(24),
    r.category.padEnd(8),
    r.name.padEnd(26),
    r.description + (todoCodes.has(r.code) ? '  ⚠️조건미확정' : ''),
  );

if (problems.length) {
  console.log('\n⚠️ 검증 경고');
  for (const p of problems) console.log('  -', p);
}

if (!write) {
  console.log('\n(목록만 출력. 저장하려면 --write)');
  process.exit(problems.length ? 1 : 0);
}
if (problems.length) {
  console.error('\n검증 실패 — 저장하지 않음.');
  process.exit(1);
}

// ── 이미지 렌더 (Figma Images API → PNG) → WebP 변환 ──
mkdirSync(IMG_DIR, { recursive: true });
const targets = [
  ...rows.map((r) => ({ id: nodeIds.get(r.code).on, file: r.iconOn })),
  ...rows.map((r) => ({ id: nodeIds.get(r.code).off, file: r.iconOff })),
];
let saved = 0;
let pngBytes = 0;
let webpBytes = 0;
for (let i = 0; i < targets.length; i += 40) {
  const chunk = targets.slice(i, i + 40);
  const { images, err } = await figmaGet(
    `/v1/images/${FILE_KEY}?ids=${encodeURIComponent(chunk.map((t) => t.id).join(','))}&format=png&scale=${SCALE}`,
  );
  if (err) throw new Error(`Images API: ${err}`);
  await Promise.all(
    chunk.map(async (t) => {
      const url = images?.[t.id];
      if (!url) return console.log(`  ✗ ${t.file} (렌더 URL 없음)`);
      const res = await fetch(url);
      if (!res.ok) return console.log(`  ✗ ${t.file} (${res.status})`);
      const png = Buffer.from(await res.arrayBuffer());
      pngBytes += png.length;
      // alphaQuality 100 — 배지 테두리 투명도가 뭉개지면 지저분해진다
      const webp = await sharp(png)
        .webp({ quality: QUALITY, alphaQuality: 100, effort: 6 })
        .toBuffer();
      webpBytes += webp.length;
      writeFileSync(resolve(IMG_DIR, t.file), webp);
      if (keepPng) writeFileSync(resolve(IMG_DIR, t.file.replace(/\.webp$/, '.png')), png);
      saved++;
    }),
  );
}

// ── CSV (백엔드 시딩용) ──
const CSV_COLS = [
  ['code', 'code'],
  ['category', 'category'],
  ['sort_order', 'sortOrder'],
  ['name', 'name'],
  ['description', 'description'],
  ['unlock_condition', 'unlockCondition'],
  ['icon_on', 'iconOn'],
  ['icon_off', 'iconOff'],
];
const esc = (v) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = [
  CSV_COLS.map(([h]) => h).join(','),
  ...rows.map((r) => CSV_COLS.map(([, k]) => esc(r[k])).join(',')),
].join('\n');
// Excel 한글 깨짐 방지 BOM
writeFileSync(resolve(OUT_DIR, 'achievements.csv'), '﻿' + csv + '\n');
writeFileSync(resolve(OUT_DIR, 'achievements.json'), JSON.stringify(rows, null, 2) + '\n');

const mb = (b) => (b / 1024 / 1024).toFixed(2) + 'MB';
console.log(`\n저장 완료`);
console.log(
  `  WebP ${saved}개 (@${SCALE}x, q${QUALITY}) → export/achievements/images/` +
    `  [PNG ${mb(pngBytes)} → WebP ${mb(webpBytes)}, ${(100 - (webpBytes / pngBytes) * 100).toFixed(0)}% 절감]`,
);
if (keepPng) console.log(`  PNG 원본 ${saved}개도 같이 저장`);
console.log(`  export/achievements/achievements.csv`);
console.log(`  export/achievements/achievements.json`);
