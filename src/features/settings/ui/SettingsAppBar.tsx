import IcBack from '@/shared/ui/icons/ic-back.svg?react';

/**
 * V13 공통 앱바 (V13_설정 618:1110 / V13_설정_내정보 618:1124).
 * 뒤로가기 40×40(좌 16, 상태바 아래 2) + 가운데 제목 `label`(P_SB_15), 행 높이 40.
 * 온보딩 헤더(좌측 정렬 대형 제목)와는 다른 패턴이라 별도 컴포넌트로 둔다.
 */
export function SettingsAppBar({
  title,
  onBack,
  backTestId,
}: {
  title: string;
  onBack: () => void;
  backTestId: string;
}) {
  return (
    <header className="relative flex h-10 items-center px-4 pt-safe-top">
      <button
        type="button"
        data-testid={backTestId}
        aria-label="뒤로가기"
        onClick={onBack}
        className="mt-0.5 flex h-10 w-10 items-center justify-center text-black"
      >
        <IcBack aria-hidden className="h-10 w-10" />
      </button>
      <h1 className="pointer-events-none absolute inset-x-0 mt-0.5 text-center text-label text-black">
        {title}
      </h1>
    </header>
  );
}
