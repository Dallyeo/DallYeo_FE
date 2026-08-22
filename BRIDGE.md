# 달여 — 네이티브 ↔ 웹 브릿지 계약 (iOS/Android 인계용)

> 이 문서는 **웹 레포의 실제 구현 기준**이다. 구현 파일: `src/shared/bridge/bridgeAdapter.ts`, `src/shared/bridge/types.ts`, `src/shared/services/BridgeService.ts`.
> 웹은 이 계약만 알고 플랫폼 API를 직접 호출하지 않는다. 브라우저 개발용 목 어댑터는 `src/shared/bridge/mockBridge.ts`.

---

## 1. 통신 규약

`postMessage`는 단방향이라 **request-id + promise registry**로 응답을 매칭한다.

**웹 → 네이티브**
```js
window.DallYeoBridge.postMessage(JSON.stringify({ id, method, params }))
```

**네이티브 → 웹 (응답)**
```js
window.__dallyeoBridgeResolve({ id, ok: true,  data })
window.__dallyeoBridgeResolve({ id, ok: false, error: { kind, message } })
```
- `kind`: `'cancelled' | 'failed' | 'timeout'` — 사용자가 취소하면 반드시 **`cancelled`**로 보내야 웹이 에러 화면 대신 조용히 복귀한다.
- 웹 타임아웃 **10초**(`BRIDGE_TIMEOUT_MS`). 그 안에 응답이 없으면 `timeout` 처리.

**네이티브 → 웹 (이벤트, 요청 없이 발생)**
```js
window.__dallyeoBridgeEmit({ event, payload })
```

> 웹은 `window.DallYeoBridge` 존재 여부로 실기기/브라우저를 판별한다. 주입은 **웹 콘텐츠 로드 전**에 되어야 한다.

---

## 2. 웹이 호출하는 메서드

### 응답이 필요한 것 (`invoke` — Promise)

| method | params | 반환 |
|---|---|---|
| `login` | `{ provider: 'kakao' \| 'apple' }` | `{ session, token }` |
| `logout` | — | `void` |
| `getCurrentSession` | — | `{ session, token }` 또는 `null` |
| `getPermissionStatus` | `{ type: 'location' \| 'notification' }` | `PermissionStatus` |
| `requestPermission` | `{ type }` | `PermissionStatus` |
| `pickProfilePhoto` | — | `string` (이미지 URL 또는 data URI) |

`PermissionStatus` = `'granted' | 'denied' | 'blocked' | 'undetermined'`

```ts
session: { userId: string; displayName?: string; expiresAt?: string }  // ISO 8601
token:   string   // 백엔드 Bearer 토큰
```

### 응답이 없는 것 (`post` — 단방향)

| method | params |
|---|---|
| `openCourseSearch` | — |
| `openCourseConfirm` | `{ course }` |
| `share` | `{ payload: { title?, text?, url? } }` |
| `openExternalUrl` | `{ url: string }` |

---

## 3. 네이티브가 보내는 이벤트

| event | payload |
|---|---|
| `sessionChanged` | `{ status: 'authenticated' \| 'unauthenticated', session?, token? }` |
| `runCompleted` | `RunResult` (아래) |
| `runCancelled` | — |
| `permissionChanged` | `{ type, status }` |

**`runCompleted` 페이로드** — 이걸 받아야 V10 완주결과 화면이 뜬다.
```ts
{
  runId: string;
  courseId?: string;
  distanceKm: number;          // km
  durationSec: number;
  avgPaceSecPerKm: number;
  calories: number;
  completionRate: number;      // 0~100
  routePolyline: { lat, lng }[];
  staticMapImageUrl: string;   // 정적 이미지 URL (지도 SDK 아님)
  endLocation: { lat, lng };   // 주변 장소 500m 조회 기준
  completedAt: string;         // ISO 8601
  startedAt?: string;
  startPlaceName?: string;     // "청송 과수원"
  endPlaceName?: string;       // "신시 전망대"
}
```

---

## 4. 세션·토큰 규칙 (중요)

- **네이티브가 단일 출처**다. OAuth 핸드셰이크 → 백엔드 토큰 교환 → Keychain 저장까지 네이티브가 한다.
- 웹은 토큰을 **메모리에만** 두고 `localStorage`에 저장하지 않는다.
- 앱 시작 시 웹이 `getCurrentSession`을 호출해 부트스트랩한다. **로그인 상태면 `token`을 반드시 함께** 줘야 Bearer 헤더가 복원된다.
- 로그인/로그아웃/만료 시 `sessionChanged`를 쏜다. 웹 설정에서 로그아웃하면 `logout`을 호출하므로 네이티브가 세션을 지우고 `sessionChanged`로 확인해준다.
- ⚠️ **WebView 안에서 OAuth를 절대 수행하지 않는다.** Google은 embedded WebView OAuth를 `disallowed_useragent`로 차단한다. 웹 로그인 화면은 버튼만 그리고 `login()`을 호출할 뿐이다.

---

## 5. 아직 계약에 없는 것 (합의 필요)

| 항목 | 상태 |
|---|---|
| `startRun(course)` | CLAUDE.md 초안엔 있으나 **웹에 미구현**. 코스 시작을 네이티브가 어떻게 트리거할지 확정 필요 |
| 티켓 이미지 **저장** | V10/V12 다운로드 버튼은 **배선만** 됨. 이미지 생성 주체(웹 canvas vs 네이티브 캡처)와 사진 권한 미합의 |
| 이미지 **공유** | 현재 `share`는 `{title, text, url}`만. 이미지 공유하려면 payload 확장 필요 |

---

## 6. 웹 실행 방법

```bash
pnpm install
pnpm dev      # 브라우저 개발 (MSW 목 + 목 브릿지 자동)
pnpm build    # dist/ 생성 → 앱에 번들
```

- 웹은 **로컬 번들**로 앱에 포함하는 방식이 기본이다(오프라인 대응).
- 라우트: `/onboarding` `/main` `/run-result` `/records` `/records/:id` `/achievements` `/settings` `/settings/edit` `/settings/account`
- 온보딩 가드: `localStorage['dallyeo.onboarding.completed'] !== 'true'`면 `/onboarding`으로 리다이렉트.

## 7. 디버깅

- **iOS**: `WKWebView.isInspectable = true` (iOS 16.4+) → Safari 개발자 메뉴에서 Web Inspector
- **Android**: `chrome://inspect`
- 브릿지 이벤트가 안 오면 콘솔에서 `window.DallYeoBridge` 존재 여부부터 확인
- 목 브릿지 강제: `.env.local`에 `VITE_FORCE_MOCK_BRIDGE=true`

## 8. WebView 설정 체크리스트

- `viewport-fit=cover` + `env(safe-area-inset-*)` 사용 중 → **safe area 인셋이 실제로 전달되어야** 레이아웃이 맞는다
- 높이는 `100dvh` 사용(`100vh` 아님)
- 오버스크롤 바운스 / 롱프레스 콜아웃 / 탭 하이라이트는 웹에서 차단해 뒀음
- **iOS 좌측엣지 뒤로가기**: 웹은 수평 스와이프를 가로채지 않는다. 바텀시트/모달은 history 엔트리로 관리하므로 뒤로가기로 닫힌다

---

## 9. ⚠️ CORS — 실기기 연동 전 반드시 해결

공개 API(`https://dallyeo.cloud`)가 **`Access-Control-Allow-Origin` 헤더를 보내지 않는다.**
- 응답은 200이지만 브라우저/WebView가 차단한다(`TypeError: Failed to fetch`).
- 웹 개발은 Vite 프록시(`/public-api`)로 우회 중이지만 **WKWebView에도 CORS가 적용되므로 실기기에서는 그대로 실패한다.**
- **백엔드에 CORS 허용 요청 필요.** 웹을 로컬 번들로 싣는 구조라 Origin이 `file://`/커스텀 스킴/`null`이 될 수 있으니, 허용 오리진을 백엔드와 미리 맞춰야 한다.
### 증상
웹 브라우저에서는 코스가 보이는데 **앱에 심으면 "불러오지 못했어요"**가 뜬다.
(웹 개발은 Vite 프록시를 타지만 앱은 `https://dallyeo.cloud`를 직접 호출하기 때문)

Web Inspector 콘솔에 다음이 찍히면 CORS/네트워크 차단이 확정이다:
```
[api] 요청 실패 — 네트워크 또는 CORS 차단  { url: "https://dallyeo.cloud/courses?region=GUNSAN", cause: "TypeError: Load failed" }
```

### 해결 방법 (둘 중 하나)

**A. 백엔드에 CORS 허용 (권장, 가장 간단)**
공개 GET 엔드포인트(`/regions`, `/courses`, `/courses/{id}`, `/places/nearby`)에 응답 헤더 추가:
```
Access-Control-Allow-Origin: *
```
인증이 필요 없는 공개 데이터라 `*`로 충분하다(쿠키를 안 쓰므로 credentials 이슈 없음).
⚠️ 로컬 번들이라 요청 Origin이 `null`이 될 수 있어 **특정 오리진만 허용하면 실패**한다.

**B. 네이티브가 프록시 (백엔드 수정 없이)**
1. 웹 번들을 `file://`가 아닌 **커스텀 스킴**으로 로드하고 `WKURLSchemeHandler`를 등록
2. 웹 로드 **전에** base를 주입:
   ```swift
   // WKUserScript, .atDocumentStart
   window.__DALLYEO_PUBLIC_API_BASE__ = "/public-api";
   ```
3. 핸들러에서 `/public-api/*` 요청을 받아 네이티브가 `https://dallyeo.cloud/*`로 대신 호출해 응답 반환
   → 네이티브 요청이라 CORS가 적용되지 않는다.

`window.__DALLYEO_PUBLIC_API_BASE__`는 **리빌드 없이** 공개 API base를 바꾸는 공식 훅이다
(우선순위: 런타임 주입 > 빌드 환경변수 > 기본값).

## 10. 백엔드 미제공 필드 (웹에서 확인 요청 중)

`docs/backend/backend-api.md` 기준으로 아직 응답에 없는 값들 — 화면에는 자리가 있다.

- `calories` — 어느 엔드포인트에도 없음 (V10 결과 / V11 기록 리스트에 표시 자리 있음)
- `GET /runs` 목록의 `averagePaceSeconds` — 상세에만 있어 웹이 `소요시간 ÷ 거리`로 계산 중
- `completionRate` — "계산 기준 확정 후 추가"로 보류 상태
- 정적 지도 이미지 URL — `polyline`만 옴. V12는 현재 빈 이미지 자리로 둠
- 코스 `estimatedTime` — 없어서 웹이 **6분/km 가정으로 추정** 중(`courseRepository.estimateTime`)
- 코스 `previewImageUrl` — 없음. 코스정보 팝업 미리보기는 빈 자리
