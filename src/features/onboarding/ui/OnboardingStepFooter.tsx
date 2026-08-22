/**
 * V01 온보딩 스텝 공통 하단 (권한안내 기준 스펙).
 * 주 버튼(동의하기/시작하기): subheading(SB_17), radius 8(rounded-md), 비활성 시 solid gray.
 * 건너뛰기: caption-tight(P_M_12_line). 간격: 주 버튼→건너뛰기 23, 건너뛰기→하단 32.
 */
export function OnboardingStepFooter({
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  primaryTestId,
  onSkip,
  skipTestId,
}: {
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  primaryTestId: string;
  onSkip: () => void;
  skipTestId: string;
}) {
  return (
    <div className="flex flex-col items-center gap-[23px] pb-8">
      <button
        type="button"
        data-testid={primaryTestId}
        disabled={primaryDisabled}
        onClick={onPrimary}
        className={`h-[59px] w-full rounded-md text-subheading text-white ${
          primaryDisabled ? 'bg-gray-disabled' : 'bg-green-700'
        }`}
      >
        {primaryLabel}
      </button>
      {/* 시안 건너뛰기 색 #919191은 published Style이 아닌 일회성 값 → 가장 가까운 시스템 색 gray-500 사용 */}
      <button
        type="button"
        data-testid={skipTestId}
        onClick={onSkip}
        className="text-caption-tight text-gray-500 underline"
      >
        건너뛰기
      </button>
    </div>
  );
}
