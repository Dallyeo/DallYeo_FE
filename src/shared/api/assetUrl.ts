import { env } from '@/shared/config/env';

/**
 * 백엔드가 주는 **서버 기준 절대 경로**(`/uploads/runs/...`, `/images/achievements/...`)를
 * 화면에서 바로 쓸 수 있는 URL로 바꾼다 (be-spec-new-260913 §9-9).
 *
 * 이미지 자체는 토큰 없이 열리므로 `<img src>`에 그대로 넣으면 된다.
 * 이미 절대 URL(`http…`)이거나 data URL이면 손대지 않는다 — 목/시드 데이터가 섞여 있다.
 * dev에서는 `env.apiBaseUrl`이 Vite 프록시(`/public-api`)라 그 접두사가 붙는다.
 */
export function toAssetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  const base = env.apiBaseUrl.replace(/\/$/, '');
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
}
