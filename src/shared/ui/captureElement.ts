import { getFontEmbedCSS, toPng } from 'html-to-image';

/**
 * DOM 엘리먼트 → PNG data URL.
 *
 * **왜 웹에서 그리나** — 네이티브 `WKWebView.takeSnapshot(rect:)`은 "화면의 그 사각형"을
 * 그대로 찍기 때문에 티켓의 둥근 모서리·절취선 구멍 자리에 **뒤 배경(초록)이 같이 찍힌다**.
 * 티켓만 투명 배경으로 떼어내려면 엘리먼트 단위 렌더가 필요하다.
 *
 * html-to-image는 노드를 복제해 SVG `foreignObject`에 넣고 브라우저가 직접 래스터라이즈한다
 * → `mask-image`/`mask-composite`(절취선 천공)와 `transform`(뜯긴 포즈)이 화면과 동일하게 나온다.
 * (html2canvas는 CSS mask를 아예 지원하지 않아 구멍이 사라진다.)
 */
export interface CaptureOptions {
  /** 출력 배율. 기본 3 (레티나 @3x 상당) */
  pixelRatio?: number;
  /** 캡처 캔버스 크기 — 자식이 transform으로 넘칠 때 지정 (기본: 노드 크기) */
  width?: number;
  height?: number;
  /** 복제본에 덧씌울 스타일 (넘침 보정용 오프셋 등) */
  style?: Partial<CSSStyleDeclaration>;
}

/** 캡처에서 제외할 노드 표시용 속성 — `<div data-capture-ignore>` */
const IGNORE_ATTR = 'data-capture-ignore';

/**
 * 폰트 임베드 — **실제로 쓰는 서브셋만** 싣는다.
 *
 * html-to-image는 복제본을 SVG 안에서 그리므로 웹폰트를 base64로 심어야 한다. 그런데
 * `getFontEmbedCSS`는 문서의 `@font-face`를 **전부** 심는다 — Pretendard는 한글을 60여 개
 * 서브셋으로 쪼개 배포하므로 CSS가 4MB가 되고, 실측 **9.9초**(MSW 켜면 **34초**)가 걸렸다.
 * 티켓에 실제로 쓰이는 글자는 한 줌이라 대부분이 낭비다.
 *
 * 그래서 노드의 글자에서 코드포인트를 모으고, `unicode-range`가 겹치는 face만 골라
 * 그 폰트 파일만 받아 base64로 바꾼다. 파일은 URL 단위로 캐시한다.
 * 실패하면 기존 `getFontEmbedCSS`로 폴백한다(느릴 뿐 결과는 같다).
 */
const fontFileCache = new Map<string, Promise<string>>();
let fallbackCss: Promise<string> | null = null;

/** 노드 안에 실제로 등장하는 코드포인트 */
function usedCodePoints(node: HTMLElement): Set<number> {
  const points = new Set<number>();
  for (const ch of node.textContent ?? '') points.add(ch.codePointAt(0) ?? 0);
  return points;
}

/** `U+ac00-d7a3, U+30??` 같은 범위가 쓰인 글자와 겹치는지 */
function rangeCovers(unicodeRange: string, points: Set<number>): boolean {
  for (const raw of unicodeRange.split(',')) {
    const token = raw.trim().replace(/^u\+/i, '');
    if (!token) continue;
    let start: number;
    let end: number;
    if (token.includes('-')) {
      const [a = '', b = ''] = token.split('-');
      start = parseInt(a, 16);
      end = parseInt(b, 16);
    } else if (token.includes('?')) {
      start = parseInt(token.replace(/\?/g, '0'), 16);
      end = parseInt(token.replace(/\?/g, 'f'), 16);
    } else {
      start = end = parseInt(token, 16);
    }
    if (Number.isNaN(start) || Number.isNaN(end)) continue;
    for (const cp of points) if (cp >= start && cp <= end) return true;
  }
  return false;
}

/** 문서의 모든 @font-face 규칙 (읽을 수 없는 교차출처 시트는 건너뜀) */
function fontFaceRules(doc: Document): { rule: CSSFontFaceRule; base: string }[] {
  const found: { rule: CSSFontFaceRule; base: string }[] = [];
  for (const sheet of Array.from(doc.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // 교차출처 시트는 읽을 수 없다
    }
    for (const rule of Array.from(rules)) {
      // instanceof는 iframe 등 다른 realm에서 깨진다 → type 상수(5 = FONT_FACE_RULE)로 판별
      if (rule.type === 5) found.push({ rule: rule as CSSFontFaceRule, base: sheet.href ?? doc.baseURI });
    }
  }
  return found;
}

const MIME_BY_EXT: Record<string, string> = {
  woff2: 'font/woff2',
  woff: 'font/woff',
  ttf: 'font/ttf',
  otf: 'font/otf',
};

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function fetchFontAsDataUrl(url: string): Promise<string> {
  const cached = fontFileCache.get(url);
  if (cached) return cached;
  const job = (async () => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`font ${response.status}`);
    const ext = (url.split('?')[0]?.split('.').pop() ?? '').toLowerCase();
    return `data:${MIME_BY_EXT[ext] ?? 'font/woff2'};base64,${toBase64(await response.arrayBuffer())}`;
  })();
  fontFileCache.set(url, job);
  job.catch(() => fontFileCache.delete(url)); // 실패는 캐시하지 않는다
  return job;
}

/** 쓰이는 글자를 담당하는 face만 골라 base64로 인라인한 CSS */
async function buildFontEmbedCss(node: HTMLElement): Promise<string> {
  const doc = node.ownerDocument;
  const points = usedCodePoints(node);
  const blocks: Promise<string>[] = [];

  for (const { rule, base } of fontFaceRules(doc)) {
    const unicodeRange = rule.style.getPropertyValue('unicode-range');
    // unicode-range가 없으면 전체 담당 face → 항상 포함
    if (unicodeRange && !rangeCovers(unicodeRange, points)) continue;

    const cssText = rule.cssText;
    const urls = [...cssText.matchAll(/url\((['"]?)([^'")]+)\1\)/g)];
    if (urls.length === 0) {
      blocks.push(Promise.resolve(cssText)); // local() 전용 face
      continue;
    }
    blocks.push(
      (async () => {
        let out = cssText;
        for (const [whole, , href] of urls) {
          if (!whole || !href) continue;
          const absolute = new URL(href, base).href;
          out = out.replace(whole, `url("${await fetchFontAsDataUrl(absolute)}")`);
        }
        return out;
      })(),
    );
  }

  return (await Promise.all(blocks)).join('\n');
}

function resolveFontEmbedCss(node: HTMLElement): Promise<string> {
  return buildFontEmbedCss(node).catch(() => {
    // 스타일시트를 못 읽는 등 예외 상황 — 느리지만 확실한 기존 경로로
    fallbackCss ??= getFontEmbedCSS(node).catch(() => {
      fallbackCss = null;
      return '';
    });
    return fallbackCss;
  });
}

/**
 * 캡처 준비(폰트 파일 인라인)를 미리 돌려둔다.
 * 화면에 티켓이 붙는 순간 호출하면 사용자가 저장/공유를 누를 때 이미 캐시가 차 있다.
 */
export function prewarmCapture(node: HTMLElement): void {
  void resolveFontEmbedCss(node);
}

function isCapturable(node: HTMLElement): boolean {
  // 텍스트 노드 등 속성이 없는 노드도 들어온다
  return typeof node.hasAttribute !== 'function' || !node.hasAttribute(IGNORE_ATTR);
}

export async function captureElementToPng(
  node: HTMLElement,
  options: CaptureOptions = {},
): Promise<string> {
  const config = {
    pixelRatio: options.pixelRatio ?? 3,
    // 배경을 지정하지 않아야 노치 구멍과 바깥이 **투명**으로 남는다
    // cacheBust는 쓰지 않는다 — 지도 이미지를 매번 새로 받아 캡처가 느려진다
    fontEmbedCSS: await resolveFontEmbedCss(node),
    filter: isCapturable,
    ...(options.width !== undefined ? { width: options.width } : {}),
    ...(options.height !== undefined ? { height: options.height } : {}),
    ...(options.style ? { style: options.style as Record<string, string> } : {}),
  };

  // Safari/WKWebView는 foreignObject 첫 렌더에서 이미지·웹폰트가 빠진 채 나오는 경우가 있다
  // (html-to-image #361). 첫 호출로 리소스를 캐시에 올리고 두 번째 결과를 쓴다.
  await toPng(node, config);
  return toPng(node, config);
}

/**
 * 여러 엘리먼트를 **transform 적용 후 실제 위치 기준**으로 감싸는 캡처 박스를 계산한다.
 *
 * 부모의 `getBoundingClientRect()`는 자식의 transform 넘침을 포함하지 않는다 —
 * 뜯긴 티켓은 아랫조각이 40px 내려가고 윗조각이 기울어지므로, 부모 크기로 캡처하면 잘린다.
 * 그래서 조각들의 rect를 합집합으로 구하고, 부모 기준 오프셋을 스타일로 되민다.
 *
 * @param container 캡처할 부모 노드
 * @param parts     transform이 걸린 자식들
 * @param padding   drop-shadow 여유 (기본 12)
 */
export function measureCaptureBox(
  container: HTMLElement,
  parts: HTMLElement[],
  padding = 12,
): CaptureOptions {
  const base = container.getBoundingClientRect();
  const rects = parts.map((el) => el.getBoundingClientRect());
  if (rects.length === 0) return {};

  const left = Math.min(base.left, ...rects.map((r) => r.left)) - padding;
  const top = Math.min(base.top, ...rects.map((r) => r.top)) - padding;
  const right = Math.max(base.right, ...rects.map((r) => r.right)) + padding;
  const bottom = Math.max(base.bottom, ...rects.map((r) => r.bottom)) + padding;

  return {
    width: Math.ceil(right - left),
    height: Math.ceil(bottom - top),
    style: {
      // 복제본을 캔버스 안쪽으로 밀어 넘친 부분까지 담는다
      transform: `translate(${base.left - left}px, ${base.top - top}px)`,
      transformOrigin: '0 0',
    } as Partial<CSSStyleDeclaration>,
  };
}
