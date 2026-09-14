import { useCallback, useEffect, useRef, useState } from 'react';
import type { ImagePayload } from '@/domain/types';
import { BridgeError } from '@/shared/bridge';
import { bridgeService } from '@/shared/services/BridgeService';
import { logger } from '@/shared/observability/logger';
import { toast } from '@/shared/ui/toastStore';
import { captureElementToPng, measureCaptureBox, prewarmCapture } from './captureElement';

/** 캡처 박스 계산에 포함할 조각 표시 — transform으로 넘치는 자식에 붙인다 */
const PART_SELECTOR = '[data-capture-part]';

export type CaptureAction = 'save' | 'share';

interface Options {
  /** 저장 파일명 (확장자 제외). 호출 시점에 평가된다 */
  fileName: () => string;
  /** 공유 시트 문구 */
  text?: () => string;
}

/**
 * 특정 영역을 PNG로 떠서 **네이티브 앨범 저장 / 공유 시트**로 넘기는 훅 (V10·V12 티켓).
 *
 * 배경 없이 그 엘리먼트만 담아야 하므로 캡처는 웹이 하고(→ `captureElement`),
 * 전달은 네이티브가 한다(웹에는 앨범 쓰기 API가 없고 `navigator.share`는 WebView에서
 * 신뢰할 수 없다). 브라우저에서는 mock 브릿지가 파일 다운로드로 대신 보여준다.
 */
export function useCaptureShare({ fileName, text }: Options) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<CaptureAction | null>(null);

  // 첫 캡처는 한글 웹폰트 임베드(4MB)에 ~10초가 걸린다 — 화면에 들어오면 미리 데워둔다.
  // deps 없이 매 렌더 확인하는 이유: 캡처 대상이 **비동기로 나중에 붙는** 화면이 있다
  // (V12는 기록을 불러온 뒤에야 티켓이 렌더된다). `prewarmCapture`는 한 번 데워지면 no-op이다.
  useEffect(() => {
    if (containerRef.current) prewarmCapture(containerRef.current);
  });

  const buildPayload = useCallback(async (): Promise<ImagePayload | null> => {
    const node = containerRef.current;
    if (!node) return null;
    const parts = Array.from(node.querySelectorAll<HTMLElement>(PART_SELECTOR));
    const box = measureCaptureBox(node, parts);
    const dataUrl = await captureElementToPng(node, box);
    const caption = text?.();
    return {
      dataUrl,
      fileName: `${fileName()}.png`,
      ...(caption ? { text: caption } : {}),
    };
  }, [fileName, text]);

  const run = useCallback(
    async (action: CaptureAction): Promise<void> => {
      if (busy) return; // 연타 방지 — 캡처는 수백 ms 걸린다
      setBusy(action);
      try {
        const payload = await buildPayload();
        if (!payload) return;
        if (action === 'share') {
          await bridgeService.shareImage(payload);
          return;
        }
        const outcome = await bridgeService.saveImage(payload);
        if (outcome === 'saved') toast.show('사진에 저장했어요.');
        else if (outcome === 'denied') toast.show('사진 접근 권한이 필요해요. 설정에서 허용해주세요.');
        else toast.show('저장에 실패했어요. 잠시 후 다시 시도해주세요.');
      } catch (e) {
        /*
         * 네이티브가 이 메서드를 아직 구현하지 않은 경우가 두 갈래다:
         *  - 아예 응답이 없으면 10초 뒤 `timeout`
         *  - 메서드 화이트리스트에서 거절하면 즉시 `failed` + "unknown method" 메시지
         * (2026-09-14 현재 iOS `BridgeMethod` enum에 saveImage/shareImage가 없어 후자로 온다)
         * 둘 다 "앱을 업데이트하세요"가 맞는 안내다 — "이미지를 만들지 못했어요"는 오해를 준다.
         */
        const unsupported = isUnsupportedMethod(e);
        logger.error('ticket_capture_failed', {
          action,
          message: (e as Error)?.message,
        });
        toast.show(
          unsupported
            ? '앱을 업데이트하면 사용할 수 있어요.'
            : '이미지를 만들지 못했어요. 잠시 후 다시 시도해주세요.',
        );
      } finally {
        setBusy(null);
      }
    },
    [busy, buildPayload],
  );

  return {
    /** 캡처 대상 컨테이너에 연결 */
    containerRef,
    /** 진행 중인 동작 (버튼 비활성화용) */
    busy,
    saveImage: useCallback(() => run('save'), [run]),
    shareImage: useCallback(() => run('share'), [run]),
  };
}

/** 네이티브가 아직 구현하지 않은 메서드인지 — 타임아웃 또는 unknown method 거절 */
function isUnsupportedMethod(e: unknown): boolean {
  if (!(e instanceof BridgeError)) return false;
  if (e.kind === 'timeout') return true;
  return e.kind === 'failed' && /unknown[_ ]?method|unsupported|not implemented/i.test(e.message);
}
