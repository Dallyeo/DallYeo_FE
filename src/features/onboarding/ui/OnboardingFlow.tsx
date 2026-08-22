import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { useOnboarding } from '@/features/onboarding/model/useOnboarding';
import { ServiceIntroStep } from './ServiceIntroStep';
import { LocationPermissionStep } from './LocationPermissionStep';
import { BodyInfoStep } from './BodyInfoStep';

/** V01 온보딩 플로우 (탭바 없음). 단계: intro(로그인) → permission → bodyInfo */
export function OnboardingFlow() {
  const { step, setStep, requestLocation } = useOnboarding();

  return (
    // 푸터가 시안 좌표(프레임 바닥 기준)를 그대로 쓰므로 하단 인셋은 더하지 않는다
    <SafeAreaLayout topInset={false} bottomInset={false}>
      <main data-testid="onboarding-flow" className="flex min-h-0 flex-1 flex-col">
        {step === 'intro' && <ServiceIntroStep onNext={() => setStep('permission')} />}
        {step === 'permission' && (
          <LocationPermissionStep
            onRequest={requestLocation}
            onNext={() => setStep('bodyInfo')}
            onBack={() => setStep('intro')}
          />
        )}
        {step === 'bodyInfo' && <BodyInfoStep onBack={() => setStep('permission')} />}
      </main>
    </SafeAreaLayout>
  );
}
