// 파일 구조 파악 — 페이지/최상위 프레임 이름 + node-id 목록.
// 사용: node scripts/figma/list.mjs
import { figmaGet, FILE_KEY } from './client.mjs';

const file = await figmaGet(`/v1/files/${FILE_KEY}?depth=2`);

console.log(`파일: ${file.name}`);
console.log(`마지막 수정: ${file.lastModified}`);
console.log(`에디터: ${file.editorType ?? '-'}\n`);

for (const page of file.document.children ?? []) {
  const frames = (page.children ?? []).filter((n) =>
    ['FRAME', 'COMPONENT', 'COMPONENT_SET', 'SECTION'].includes(n.type)
  );
  console.log(`━━ [${page.type}] ${page.name}  (자식 ${page.children?.length ?? 0})`);
  for (const n of page.children ?? []) {
    const box = n.absoluteBoundingBox;
    const size = box ? `${Math.round(box.width)}×${Math.round(box.height)}` : '-';
    console.log(`   ${n.id.padEnd(12)} ${n.type.padEnd(14)} ${size.padEnd(11)} ${n.name}`);
  }
  if (frames.length === 0 && (page.children?.length ?? 0) === 0) console.log('   (비어 있음)');
  console.log();
}

// 변수/스타일 회수 가능 여부 판정
console.log('━━ 스타일/변수 회수 가능 여부');
const styleCount = Object.keys(file.styles ?? {}).length;
console.log(`published Styles: ${styleCount}개`);
if (styleCount > 0) {
  const byType = {};
  for (const s of Object.values(file.styles)) (byType[s.styleType] ??= []).push(s.name);
  for (const [t, names] of Object.entries(byType)) {
    console.log(`  ${t} (${names.length}): ${names.slice(0, 12).join(', ')}${names.length > 12 ? ' …' : ''}`);
  }
}
try {
  const vars = await figmaGet(`/v1/files/${FILE_KEY}/variables/local`);
  const collections = Object.values(vars.meta?.variableCollections ?? {});
  console.log(`Variables API: 사용 가능 ✅ (컬렉션 ${collections.length}개)`);
  for (const c of collections) console.log(`  - ${c.name} (변수 ${c.variableIds?.length ?? 0}개)`);
} catch (e) {
  console.log(`Variables API: 사용 불가 (${String(e.message).split('\n')[0]})`);
  console.log('  → Enterprise 전용. 해결된 값(#hex/px)으로 추출합니다.');
}
