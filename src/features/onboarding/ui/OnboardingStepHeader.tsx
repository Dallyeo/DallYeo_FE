import type { ReactNode } from 'react';
import IcBack from '@/shared/ui/icons/ic-back.svg?react';

/**
 * V01 온보딩 스텝 공통 헤더 (권한안내 기준 스펙).
 * 뒤로가기 40×40(위 2 / 왼 16) · 제목 headline(P_SB_23) · 부제 body-sm(P_M_14).
 * 간격: 뒤로가기→제목 29, 제목→부제 15. (섹션 px-4=16 컨텍스트 전제 → 뒤로가기 flush = 왼 16)
 */
export function OnboardingStepHeader({
  onBack,
  backTestId,
  title,
  subtitle,
}: {
  onBack: () => void;
  backTestId: string;
  title: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        data-testid={backTestId}
        aria-label="뒤로"
        onClick={onBack}
        className="mt-0.5 flex h-10 w-10 items-center justify-center text-black"
      >
        <IcBack aria-hidden className="h-6 w-6" />
      </button>
      <h1 className="mt-[29px] text-headline text-black">{title}</h1>
      {subtitle && <p className="mt-[15px] text-body-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}
