import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppRoot } from '@/app/AppRoot';
import { env } from '@/shared/config/env';
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
