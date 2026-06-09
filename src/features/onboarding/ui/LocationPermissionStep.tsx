import { useState } from 'react';
import type { PermissionStatus } from '@/domain/types';
import { Button } from '@/shared/ui';

export function LocationPermissionStep({
  onRequest,
  onNext,
}: {
  onRequest: () => Promise<PermissionStatus>;
  onNext: () => void;
}) {
  const [status, setStatus] = useState<PermissionStatus | null>(null);

  async function handleRequest() {
    const result = await onRequest();
    setStatus(result);
  }

  const limited = status === 'denied' || status === 'blocked';

  return (
    <section data-testid="onboarding-permission" className="flex flex-1 flex-col justify-between p-6">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="text-xl">위치 권한</h1>
        <p className="mt-2 text-sm text-muted">달리기 기록을 위해 위치 권한이 필요해요.</p>
        {limited && (
          <p data-testid="onboarding-permission-limited" className="mt-3 text-sm text-danger">
            위치 권한이 없으면 일부 기능이 제한될 수 있어요.
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Button data-testid="onboarding-permission-request" onClick={handleRequest}>
          위치 권한 허용
        </Button>
        <Button variant="secondary" data-testid="onboarding-permission-next" onClick={onNext}>
          다음
        </Button>
      </div>
    </section>
  );
}
