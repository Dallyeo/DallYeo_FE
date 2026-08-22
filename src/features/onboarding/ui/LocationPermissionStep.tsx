import type { PermissionStatus } from '@/domain/types';
import IcLocation from '@/shared/ui/icons/ic-location-on.svg?react';
import { OnboardingStepHeader } from './OnboardingStepHeader';
import { OnboardingStepFooter } from './OnboardingStepFooter';

/**
 * V01 권한 안내 (온보딩 2단계). 위치 권한 요청.
 * 동의하기 → 브리지 권한 요청 후 다음. 건너뛰기 → 요청 없이 다음.
 */
export function LocationPermissionStep({
  onRequest,
  onNext,
  onBack,
}: {
  onRequest: () => Promise<PermissionStatus>;
  onNext: () => void;
  onBack: () => void;
}) {
  async function handleAgree() {
    await onRequest();
    onNext();
  }

  return (
    <section
      data-testid="onboarding-permission"
      className="flex flex-1 flex-col px-4 pt-safe-top"
    >
      <OnboardingStepHeader
        onBack={onBack}
        backTestId="onboarding-permission-back"
        title={
          <>
            앱 사용을 위해
            <br />
            필수 권한을 허용해주세요.
          </>
        }
        subtitle="미허용 시 서비스 사용에 제한이 있어요."
      />

      {/* 권한 항목 — 위치. 시안: 부제와 간격 48, 원 54, 원↔텍스트 25, 텍스트 줄간격 3 */}
      <div className="mt-12 flex items-center gap-[25px]">
        <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full bg-gray-200 text-green-700">
          <IcLocation aria-hidden className="h-6 w-auto" />
        </div>
        <div className="flex flex-col gap-[3px]">
          <span className="text-body text-gray-900">위치</span>
          <span className="text-body-sm text-gray-500">출발 위치 확인 및 경로 탐색</span>
        </div>
      </div>

      <div className="flex-1" />

      <OnboardingStepFooter
        primaryLabel="동의하기"
        onPrimary={() => void handleAgree()}
        primaryTestId="onboarding-permission-request"
        onSkip={onNext}
        skipTestId="onboarding-permission-next"
      />
    </section>
  );
}
