# Performance Test Instructions

> 로컬 번들 SPA. 가벼운 목표(NFR-U0-PERF, Q6=A). 엄격 측정은 후속.

## 번들 크기 (목표 gzip < 300KB 가이드)
```bash
pnpm build   # 출력의 gzip 크기 확인
```
- 현재 메인 번들 gzip ≈ **102.5KB** (목표 충족).
- MSW는 동적 청크(`browser-*.js`)로 분리 — prod에서 VITE_ENABLE_MSW=false 시 미로드.

## 권장(후속)
- Lighthouse CI로 초기 로드/인터랙션 측정.
- 라우트 기준 코드 스플리팅(React.lazy) 적용 시 메인 번들 추가 축소.
- WebView 실기기에서 화면 전환 체감 지연 측정.

## 현재 비대상
- 서버 부하/처리량 테스트 — 백엔드 책임(본 레이어 N/A).
