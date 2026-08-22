// Figma REST API 클라이언트 — 토큰은 .env.local에서 런타임에만 읽고 절대 출력하지 않는다.
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/** .env.local에서 key 읽기 (dotenv 의존성 없이 최소 파싱) */
function readEnv(key) {
  if (process.env[key]) return process.env[key];
  try {
    const raw = readFileSync(resolve(ROOT, '.env.local'), 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      if (trimmed.slice(0, eq).trim() !== key) continue;
      return trimmed
        .slice(eq + 1)
        .trim()
        .replace(/^['"]|['"]$/g, '');
    }
  } catch {
    /* 파일 없음 */
  }
  return undefined;
}

const TOKEN = readEnv('FIGMA_TOKEN') ?? readEnv('VITE_FIGMA_TOKEN');
export const FILE_KEY = readEnv('FIGMA_FILE_KEY') ?? 'rOWOGmdzTz81lhFOumuvnJ';

if (!TOKEN) {
  console.error('FIGMA_TOKEN이 .env.local에 없습니다. (FIGMA_TOKEN=figd_...)');
  process.exit(1);
}

/** Figma API GET. 실패 시 토큰을 노출하지 않는 메시지로 종료. */
export async function figmaGet(path) {
  const res = await fetch(`https://api.figma.com${path}`, {
    headers: { 'X-Figma-Token': TOKEN },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const hint =
      res.status === 403
        ? ' → 토큰 스코프(file_content:read)나 파일 접근 권한을 확인하세요.'
        : res.status === 404
          ? ' → 파일 key가 맞는지 확인하세요.'
          : '';
    throw new Error(`Figma API ${res.status} ${res.statusText}${hint}\n${body.slice(0, 400)}`);
  }
  return res.json();
}

/** "441-1208" / "441:1208" 모두 허용 → API 형식(":")으로 정규화 */
export const normalizeNodeId = (id) => id.replace('-', ':');

export { ROOT };
