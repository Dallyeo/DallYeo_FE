import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppRoot } from '@/app/AppRoot';
import { env } from '@/shared/config/env';
// Pretendard 가변폰트(한글 다이나믹 서브셋) — 로컬 번들. 폰트 교체 지점은 tokens.css --font-sans.
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import '@/shared/styles/tokens.css';
import '@/shared/styles/global.css';

async function enableMocking(): Promise<void> {
  if (!env.enableMsw) return;
  const { worker } = await import('@/shared/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

void enableMocking().then(() => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('루트 엘리먼트(#root)를 찾을 수 없습니다.');
  }
  createRoot(rootElement).render(
    <StrictMode>
      <AppRoot />
    </StrictMode>,
  );
});
