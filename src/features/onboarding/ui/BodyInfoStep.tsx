import type { Gender } from '@/domain/types';
import { Button } from '@/shared/ui';
import { useOnboarding } from '@/features/onboarding/model/useOnboarding';

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: '남' },
  { value: 'female', label: '여' },
  { value: 'other', label: '기타' },
  { value: 'unspecified', label: '선택안함' },
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
    <section data-testid="onboarding-bodyinfo" className="flex flex-1 flex-col justify-between p-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-xl">기본 정보</h1>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted">키 (cm)</span>
          <input
            data-testid="onboarding-height-input"
            inputMode="numeric"
            value={heightRaw}
            onChange={(e) => setHeight(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2"
          />
          {heightOutOfRange && (
            <span data-testid="onboarding-height-warning" className="text-sm text-danger">
              일반적인 범위(50~250cm)를 벗어났어요.
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted">체중 (kg)</span>
          <input
            data-testid="onboarding-weight-input"
            inputMode="numeric"
            value={weightRaw}
            onChange={(e) => setWeight(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2"
          />
          {weightOutOfRange && (
            <span data-testid="onboarding-weight-warning" className="text-sm text-danger">
              일반적인 범위(20~300kg)를 벗어났어요.
            </span>
          )}
        </label>

        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted">성별</span>
          <div className="flex gap-2">
            {GENDERS.map((g) => (
              <button
                key={g.value}
                type="button"
                data-testid={`onboarding-gender-${g.value}`}
                onClick={() => setGender(g.value)}
                className={`flex-1 rounded-md border px-2 py-2 text-sm ${
                  gender === g.value ? 'border-primary text-primary' : 'border-border text-text'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button data-testid="onboarding-submit" disabled={!canSubmit} onClick={() => void complete()}>
          입력 완료
        </Button>
        <Button variant="secondary" data-testid="onboarding-skip" onClick={() => void skip()}>
          건너뛰기
        </Button>
      </div>
    </section>
  );
}
