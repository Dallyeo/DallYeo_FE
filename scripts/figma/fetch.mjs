// 파일 전체를 1회 받아 .figma-cache/file.json 에 저장. 이후 모든 스크립트는 캐시를 읽는다.
// 사용: node scripts/figma/fetch.mjs [--force]
import { writeFileSync, mkdirSync, existsSync, statSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { figmaGet, FILE_KEY, ROOT } from './client.mjs';

const CACHE_DIR = resolve(ROOT, '.figma-cache');
export const CACHE_FILE = resolve(CACHE_DIR, 'file.json');

export function loadCache() {
  if (!existsSync(CACHE_FILE)) {
    console.error('캐시 없음. 먼저 `node scripts/figma/fetch.mjs` 를 실행하세요.');
    process.exit(1);
  }
  return JSON.parse(readFileSync(CACHE_FILE, 'utf8'));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const force = process.argv.includes('--force');
  if (!force && existsSync(CACHE_FILE)) {
    const age = (Date.now() - statSync(CACHE_FILE).mtimeMs) / 1000 / 60;
    console.log(`캐시 존재 (${age.toFixed(0)}분 전). 갱신하려면 --force`);
    process.exit(0);
  }
  console.log('Figma 파일 전체 수신 중…');
  const file = await figmaGet(`/v1/files/${FILE_KEY}?geometry=paths`);
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(CACHE_FILE, JSON.stringify(file));
  const mb = (statSync(CACHE_FILE).size / 1024 / 1024).toFixed(1);
  console.log(`저장: .figma-cache/file.json (${mb} MB)`);
  console.log(`파일명: ${file.name} / 수정: ${file.lastModified}`);
  console.log(`styles: ${Object.keys(file.styles ?? {}).length}개`);
}
