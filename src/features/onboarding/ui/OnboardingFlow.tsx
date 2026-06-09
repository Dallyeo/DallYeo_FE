import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { useOnboarding } from '@/features/onboarding/model/useOnboarding';
import { ServiceIntroStep } from './ServiceIntroStep';
import { LocationPermissionStep } from './LocationPermissionStep';
import { BodyInfoStep } from './BodyInfoStep';

/** V01 온보딩 플로우 (탭바 없음). 단계: intro → permission → bodyInfo */
export function OnboardingFlow() {
  const { step, setStep, requestLocation } = useOnboarding();

  return (
    <SafeAreaLayout>
      <main data-testid="onboarding-flow" className="flex flex-1 flex-col">
        {step === 'intro' && <ServiceIntroStep onNext={() => setStep('permission')} />}
        {step === 'permission' && (
          <LocationPermissionStep onRequest={requestLocation} onNext={() => setStep('bodyInfo')} />
        )}
        {step === 'bodyInfo' && <BodyInfoStep />}
      </main>
    </SafeAreaLayout>
  );
}
