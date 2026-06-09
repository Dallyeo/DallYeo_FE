import { Button } from '@/shared/ui';

export function ServiceIntroStep({ onNext }: { onNext: () => void }) {
  return (
    <section data-testid="onboarding-intro" className="flex flex-1 flex-col justify-between p-6">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="text-xl">달여에 오신 걸 환영해요</h1>
        <p className="mt-2 text-sm text-muted">추천 코스를 달리고 기록을 남겨보세요.</p>
      </div>
      <Button data-testid="onboarding-intro-next" onClick={onNext}>
        다음
      </Button>
    </section>
  );
}
