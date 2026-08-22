// 디자인시스템 페이지의 아이콘 섹션 → SVG 일괄 export.
// 사용: node scripts/figma/icons.mjs          (목록만)
//       node scripts/figma/icons.mjs --write  (src/shared/ui/icons/ 에 저장)
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { figmaGet, FILE_KEY, ROOT } from './client.mjs';
import { loadCache } from './fetch.mjs';
import { indexById } from './screens.mjs';

// `icon`(456:2243) 섹션은 SF Symbols 글리프를 텍스트로 찍어둔 구버전 자산이라 제외한다
// (131×50 같은 비아이콘 크기가 증거 — 폰트 글리프이지 벡터 아이콘이 아님).
const SECTIONS = [{ id: '785:1916', label: '사용된 아이콘' }];

// 섹션 밖(화면 내부)에만 존재하는 아이콘을 개별 지정한다.
const EXTRA = [
  { id: '835:1728', name: 'close', section: '코스정보팝업' },
];
const OUT = resolve(ROOT, 'src/shared/ui/icons');
const write = process.argv.includes('--write');

const file = loadCache();
const byId = indexById(file.document);

/** Figma 레이어명 → 파일명(ic-kebab-case.svg) */
const toFileName = (name) => {
  const slug = name
    .trim()
    .replace(/^ic[-_\s]*/i, '')
    .replace(/[\s_/]+/g, '-')
    .replace(/[^a-zA-Z0-9가-힣-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return `ic-${slug || 'unnamed'}.svg`;
};

/**
 * Figma export SVG를 색상 제어 가능하게 정규화한다.
 * Material Symbols는 `fill="#1C1B1F"` 같은 고정색으로 나와서 Tailwind 색 클래스가 먹지 않는다.
 * → 그리기용 fill만 `currentColor`로 치환. **`<mask>` 내부의 `#D9D9D9`는 알파 마스크 정의라 유지.**
 */
export function normalizeSvg(svg) {
  // mask 블록을 잠시 봉인해 내부 fill이 치환되지 않게 한다
  const masks = [];
  let out = svg.replace(/<mask[\s\S]*?<\/mask>/g, (m) => {
    masks.push(m);
    return `<!--__MASK${masks.length - 1}__-->`;
  });
  out = out.replace(/fill="(?!none|currentColor)#[0-9a-fA-F]{3,8}"/g, 'fill="currentColor"');
  out = out.replace(/<!--__MASK(\d+)__-->/g, (_, i) => masks[Number(i)]);
  return out;
}

const targets = [];
const seen = new Set();
for (const sec of SECTIONS) {
  const node = byId.get(sec.id);
  if (!node) {
    console.log(`⚠️ 섹션 ${sec.id}(${sec.label}) 캐시에 없음`);
    continue;
  }
  for (const child of node.children ?? []) {
    if (child.visible === false) continue;
    const fileName = toFileName(child.name);
    if (seen.has(fileName)) continue; // 앞 섹션(사용된 아이콘) 우선
    seen.add(fileName);
    const b = child.absoluteBoundingBox;
    targets.push({
      id: child.id,
      name: child.name,
      fileName,
      section: sec.label,
      size: b ? `${Math.round(b.width)}×${Math.round(b.height)}` : '-',
      type: child.type,
    });
  }
}

for (const e of EXTRA) {
  const node = byId.get(e.id);
  const b = node?.absoluteBoundingBox;
  const fileName = toFileName(e.name);
  if (seen.has(fileName)) continue;
  seen.add(fileName);
  targets.push({
    id: e.id,
    name: e.name,
    fileName,
    section: e.section,
    size: b ? `${Math.round(b.width)}×${Math.round(b.height)}` : '-',
    type: node?.type ?? '-',
  });
}

console.log(`아이콘 후보 ${targets.length}개\n`);
console.log('node-id'.padEnd(12), '크기'.padEnd(9), '출처'.padEnd(14), '파일명'.padEnd(24), '원본명');
console.log('─'.repeat(92));
for (const t of targets) {
  console.log(
    t.id.padEnd(12),
    t.size.padEnd(9),
    t.section.padEnd(14),
    t.fileName.padEnd(24),
    t.name
  );
}

if (!write) {
  console.log('\n(목록만 출력. 저장하려면 --write)');
  process.exit(0);
}

// Figma Images API — 한 번에 최대 ~50개씩 나눠 요청
mkdirSync(OUT, { recursive: true });
const chunks = [];
for (let i = 0; i < targets.length; i += 40) chunks.push(targets.slice(i, i + 40));

let saved = 0;
for (const chunk of chunks) {
  const ids = chunk.map((t) => t.id).join(',');
  const { images, err } = await figmaGet(
    `/v1/images/${FILE_KEY}?ids=${encodeURIComponent(ids)}&format=svg`
  );
  if (err) throw new Error(`Images API: ${err}`);
  await Promise.all(
    chunk.map(async (t) => {
      const url = images?.[t.id];
      if (!url) {
        console.log(`  ✗ ${t.fileName} (렌더 URL 없음)`);
        return;
      }
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`  ✗ ${t.fileName} (${res.status})`);
        return;
      }
      writeFileSync(resolve(OUT, t.fileName), normalizeSvg(await res.text()));
      saved++;
    })
  );
}
console.log(`\n저장 완료: ${saved}개 → src/shared/ui/icons/`);
