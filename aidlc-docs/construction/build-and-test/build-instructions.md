# Build Instructions — 달여(DallYeo) Frontend

> 단일 SPA(Vite). 패키지 매니저: pnpm. Node: .nvmrc(20).

## 사전 준비
```bash
corepack enable pnpm        # pnpm 미설치 시
pnpm install
cp .env.example .env        # 필요 시 환경변수 조정
```

## 환경변수 (.env)
| 변수 | 기본 | 설명 |
|---|---|---|
| VITE_API_BASE_URL | /api | 백엔드 base URL |
| VITE_ENABLE_MSW | true | MSW mock 백엔드 사용(미준비 엔드포인트) |
| VITE_FORCE_MOCK_BRIDGE | false | mock 브릿지 강제(브라우저=자동) |

## 개발 서버
```bash
pnpm dev        # http://localhost:5173 — 브라우저에서 mock 브릿지 + MSW로 전체 미리보기
```

## 프로덕션 빌드
```bash
pnpm build      # tsc --noEmit + vite build → dist/
pnpm preview    # 빌드 결과 미리보기
```
- 산출물 `dist/`는 네이티브 앱에 LOCAL 번들로 동봉.
- 현재 메인 번들 gzip ≈ 102.5KB (< 300KB 목표 충족). MSW는 동적 청크로 분리(prod에서 enableMsw=false 시 미로드).

## 타입체크 / 린트 / 포맷
```bash
pnpm typecheck  # tsc --noEmit (strict + 추가 엄격)
pnpm lint       # eslint --max-warnings 0
pnpm format     # prettier --write
```

## WebView 디버깅
- iOS WKWebView: Safari Web Inspector (iOS 16.4+ isInspectable=true)
- Android WebView: chrome://inspect
