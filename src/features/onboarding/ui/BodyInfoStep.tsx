import type { Gender } from '@/domain/types';
import { Button } from '@/shared/ui';
import { useOnboarding } from '@/features/onboarding/model/useOnboarding';

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
  { value: 'unspecified', label: '입력 안함' },
];

export function BodyInfoStep() {
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
      className="flex flex-1 flex-col justify-between gap-8 p-6"
    >
      <div className="flex flex-col gap-6">
        <h1 className="text-b-22 text-text-strong">
          입력해주신 정보를 바탕으로
          <br />
          최적의 러닝코스를 안내해 드릴게요
        </h1>

        {/* 키 — 디자인은 드롭다운이나 임시로 입력창 사용(디자이너/PM 논의 예정) */}
        <label className="flex flex-col gap-1">
          <span className="text-m-15 text-text-strong">키</span>
          <div className="flex items-center rounded-md border border-border bg-surface px-4 py-3">
            <input
              data-testid="onboarding-height-input"
              inputMode="decimal"
              placeholder="167.5"
              value={heightRaw}
              onChange={(e) => setHeight(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-m-15 text-text outline-none placeholder:text-subtle"
            />
            <span className="text-m-15 text-subtle">cm</span>
          </div>
          {heightOutOfRange && (
            <span data-testid="onboarding-height-warning" className="text-r-14 text-danger">
              일반적인 범위(50~250cm)를 벗어났어요.
            </span>
          )}
        </label>

        {/* 현재 체중 */}
        <label className="flex flex-col gap-1">
          <span className="text-m-15 text-text-strong">현재 체중</span>
          <div className="flex items-center rounded-md border border-border bg-surface px-4 py-3">
            <input
              data-testid="onboarding-weight-input"
              inputMode="decimal"
              placeholder="55.0"
              value={weightRaw}
              onChange={(e) => setWeight(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-m-15 text-text outline-none placeholder:text-subtle"
            />
            <span className="text-m-15 text-subtle">kg</span>
          </div>
          {weightOutOfRange && (
            <span data-testid="onboarding-weight-warning" className="text-r-14 text-danger">
              일반적인 범위(20~300kg)를 벗어났어요.
            </span>
          )}
        </label>

        {/* 성별 */}
        <div className="flex flex-col gap-1">
          <span className="text-m-15 text-text-strong">성별</span>
          <div className="flex gap-2">
            {GENDERS.map((g) => {
              const selected = gender === g.value;
              return (
                <button
                  key={g.value}
                  type="button"
                  data-testid={`onboarding-gender-${g.value}`}
                  onClick={() => setGender(g.value)}
                  className={`flex-1 rounded-md py-3 text-m-14 ${
                    selected
                      ? 'border border-primary text-primary'
                      : 'border border-transparent bg-surface-subtle text-subtle'
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button
          data-testid="onboarding-submit"
          disabled={!canSubmit}
          onClick={() => void complete()}
          className="w-full py-3.5 text-sb-15"
        >
          시작하기
        </Button>
        <button
          type="button"
          data-testid="onboarding-skip"
          onClick={() => void skip()}
          className="text-r-14 text-muted underline"
        >
          건너뛰기
        </button>
      </div>
    </section>
  );
}
