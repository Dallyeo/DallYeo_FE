import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { fileURLToPath, URL } from 'node:url';

/** 공개 API 원본. 로컬 백엔드로 붙일 땐 VITE_PUBLIC_API_ORIGIN 으로 덮어쓴다. */
const PUBLIC_API_ORIGIN = process.env.VITE_PUBLIC_API_ORIGIN ?? 'https://dallyeo.cloud';

// https://vitejs.dev/config/
export default defineConfig({
  // svgr: `import Icon from './x.svg?react'` → 색상 제어 가능한 React 컴포넌트 (currentColor)
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      /**
       * ⚠️ 공개 API 서버가 **CORS 헤더를 보내지 않아** 브라우저에서 직접 호출하면 차단된다.
       * dev에서만 프록시로 우회한다. (실기기 WebView도 CORS를 적용하므로
       * 백엔드에 `Access-Control-Allow-Origin` 추가가 **반드시** 필요하다 — BRIDGE.md 참조)
       */
      '/public-api': {
        target: PUBLIC_API_ORIGIN,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/public-api/, ''),
      },
    },
  },
});
