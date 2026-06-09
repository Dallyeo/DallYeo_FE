import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/** 브라우저용 MSW 워커 (dev/미준비 백엔드). main.tsx에서 env.enableMsw 시 시작. */
export const worker = setupWorker(...handlers);
