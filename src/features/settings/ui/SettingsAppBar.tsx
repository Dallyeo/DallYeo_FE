import type { ReactNode } from 'react';
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
  trailing,
}: {
  title: string;
  onBack: () => void;
  backTestId: string;
  /** 우측 액션 슬롯 (예: 내정보 수정의 "저장") */
  trailing?: ReactNode;
}) {
  return (
    // 안전영역 패딩은 **바깥**에 — 고정 높이(h-10)와 같은 요소에 주면 패딩이 높이를 파먹어
    // 내용이 상태바에 붙는다.
    <header className="shrink-0">
      <div className="relative flex h-10 items-center px-4">
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
        {/* 우측 액션 — 제목이 absolute라 클릭이 막히지 않도록 뒤에 둔다 */}
        <div className="relative ml-auto mt-0.5 flex items-center">{trailing}</div>
      </div>
    </header>
  );
}
