import IcLink from '@/shared/ui/icons/ic-link-2.svg?react';
import IcDownload from '@/shared/ui/icons/ic-download.svg?react';

/**
 * 티켓 공유 / 저장 — **앱바 우측** 액션 한 쌍 (V10·V12 공용).
 *
 * Figma `V10_결과_출시버전`(1039:1598) 실측: 아이콘 상자 24×24가 우측에서 링크 80 / 저장 29,
 * 세로 중심은 뒤로가기(40×40, 상단 2)와 같은 84. 탭 영역을 24로 두면 너무 좁아 40×40으로 키우되
 * **아이콘 중심이 시안 좌표에 그대로 떨어지도록** 간격 12(`gap-3`)로 역산했다.
 * 우측 여백 20(`pr-5`)은 앱바가 준다 — 뒤로가기(좌 16)와 한 줄에 놓이기 때문.
 *
 * ⚠️ 눌림 표현을 넣지 않는다 — 공유/저장은 `useCaptureShare`의 `busy` 하나를 공유하므로
 * 어느 쪽을 눌러도 두 버튼이 **같이** 흐려졌다(= 두 개가 동시에 눌린 것처럼 보였다).
 * 연타 방지용 `disabled`는 그대로 두고 시각적 변화만 뺀다.
 */
export function TicketActions({
  busy = false,
  onShare,
  onSave,
  shareTestId = 'share',
  saveTestId = 'save-image',
}: {
  /** 캡처 진행 중 — 연타 방지용 비활성화 (색은 바뀌지 않는다) */
  busy?: boolean;
  onShare?: (() => void) | undefined;
  onSave?: (() => void) | undefined;
  shareTestId?: string;
  saveTestId?: string;
}) {
  return (
    <div className="flex items-center gap-3 text-off-white">
      <button
        type="button"
        data-testid={shareTestId}
        aria-label="티켓 공유하기"
        disabled={busy}
        onClick={onShare}
        className="flex h-10 w-10 items-center justify-center"
      >
        <IcLink aria-hidden className="h-[18px] w-auto" />
      </button>
      <button
        type="button"
        data-testid={saveTestId}
        aria-label="티켓 이미지 저장"
        disabled={busy}
        onClick={onSave}
        className="flex h-10 w-10 items-center justify-center"
      >
        <IcDownload aria-hidden className="h-4 w-auto" />
      </button>
    </div>
  );
}
