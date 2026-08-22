import type { Gender } from '@/domain/types';
import { useOnboarding } from '@/features/onboarding/model/useOnboarding';
import { OnboardingStepHeader } from './OnboardingStepHeader';
import { OnboardingStepFooter } from './OnboardingStepFooter';

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
];

/** V01 정보 입력 (온보딩 3단계). 키/체중/성별 → 시작하기. 건너뛰기 가능. */
export function BodyInfoStep({ onBack }: { onBack: () => void }) {
  const {
    heightRaw,
    weightRaw,
    gender,
    canSubmit,
    heightOutOfRange,
    weightOutOfRange,
    setHeight,
    setWeight,
    setGender,
    complete,
    skip,
  } = useOnboarding();

  return (
    <section
      data-testid="onboarding-bodyinfo"
      className="flex flex-1 flex-col px-4 pt-safe-top"
    >
      <OnboardingStepHeader
        onBack={onBack}
        backTestId="onboarding-bodyinfo-back"
        title="정보를 입력해주세요."
        subtitle={
          <>
            키와 몸무게를 바탕으로 더 정확한 러닝 통계를 제공해드려요.
            <br />
            통계 확인 이외에는 개인정보를 활용하지 않아요.
          </>
        }
      />

      {/* 시안: 부제와 간격 36, 그룹 간 30, 그룹 내 라벨→입력 15.
          라벨·값 색은 입력 여부로 갈림 — 미입력 gray-disabled / 입력됨 gray-700 */}
      <div className="mt-9 flex flex-col gap-[30px]">
        {/* 키 */}
        <label className="flex flex-col gap-[15px]">
          <span className={`text-body-sm ${heightRaw ? 'text-gray-700' : 'text-gray-disabled'}`}>
            키
          </span>
          <div className="flex items-baseline justify-between gap-2 border-b border-gray-700 px-[23px] pb-[13px] pt-[15px]">
            <input
              data-testid="onboarding-height-input"
              inputMode="decimal"
              placeholder="160"
              value={heightRaw}
              onChange={(e) => setHeight(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-subheading text-gray-700 outline-none placeholder:text-gray-disabled"
            />
            <span className={`text-label ${heightRaw ? 'text-gray-700' : 'text-gray-disabled'}`}>
              cm
            </span>
          </div>
          {heightOutOfRange && (
            <span data-testid="onboarding-height-warning" className="text-footnote text-red">
              일반적인 범위(50~250cm)를 벗어났어요.
            </span>
          )}
        </label>

        {/* 현재 체중 */}
        <label className="flex flex-col gap-[15px]">
          <span className={`text-body-sm ${weightRaw ? 'text-gray-700' : 'text-gray-disabled'}`}>
            현재 체중
          </span>
          <div className="flex items-baseline justify-between gap-2 border-b border-gray-700 px-[23px] pb-[13px] pt-[15px]">
            <input
              data-testid="onboarding-weight-input"
              inputMode="decimal"
              placeholder="50"
              value={weightRaw}
              onChange={(e) => setWeight(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-subheading text-gray-700 outline-none placeholder:text-gray-disabled"
            />
            <span className={`text-label ${weightRaw ? 'text-gray-700' : 'text-gray-disabled'}`}>
              kg
            </span>
          </div>
          {weightOutOfRange && (
            <span data-testid="onboarding-weight-warning" className="text-footnote text-red">
              일반적인 범위(20~300kg)를 벗어났어요.
            </span>
          )}
        </label>

        {/* 성별 — 시안: 버튼 45 높이, r8, 간격 15 */}
        <div className="flex flex-col gap-[15px]">
          <span className={`text-body-sm ${gender ? 'text-gray-700' : 'text-gray-disabled'}`}>
            성별
          </span>
          <div className="flex gap-[15px]">
            {GENDERS.map((g) => {
              const selected = gender === g.value;
              return (
                <button
                  key={g.value}
                  type="button"
                  data-testid={`onboarding-gender-${g.value}`}
                  onClick={() => setGender(g.value)}
                  className={`h-[45px] flex-1 rounded-md text-body-sm ${
                    selected ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-disabled'
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1" />

      <OnboardingStepFooter
        primaryLabel="시작하기"
        onPrimary={() => void complete()}
        primaryDisabled={!canSubmit}
        primaryTestId="onboarding-submit"
        onSkip={() => void skip()}
        skipTestId="onboarding-skip"
      />
    </section>
  );
}
