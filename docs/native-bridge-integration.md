# 네이티브 브릿지 명세 (iOS / Android)

- 웹은 시작 시 `window.DallYeoBridge` 가 있다고 가정합니다. 네이티브에서 주입해 주세요.
- 주입이 없으면 웹은 mock 브릿지로 동작합니다(브라우저 미리보기용). 실기기에선 꼭 주입 필요.

---

## 메시지 규격

**웹 → 네이티브** : `window.DallYeoBridge.postMessage(jsonString)`

```json
// 응답 필요 (id 있음)
{ "id": "req_1", "method": "login", "params": { "provider": "kakao" } }
// 단방향 (id 없음, 응답 불필요)
{ "method": "openCourseSearch", "params": {} }
```

**네이티브 → 웹 응답** : `evaluateJavaScript` 로 호출

```js
window.__dallyeoBridgeResolve({ id: "req_1", ok: true,  data: { ... } });
window.__dallyeoBridgeResolve({ id: "req_1", ok: false, error: { kind: "cancelled" } });
```

**네이티브 → 웹 이벤트** :

```js
window.__dallyeoBridgeEmit({ event: "sessionChanged", payload: { ... } });
```

---

## 메서드 (웹이 호출 → 네이티브 구현)

| method | 응답 | params | 응답 data |
|---|---|---|---|
| `login` | O | `{ provider: "kakao" \| "apple" }` | `{ session, token }` |
| `logout` | O | `{}` | 없음 |
| `getCurrentSession` | O | `{}` | `session` 또는 `null` |
| `requestPermission` | O | `{ type: "location" }` | `PermissionStatus` |
| `getPermissionStatus` | O | `{ type: "location" }` | `PermissionStatus` |
| `openCourseSearch` | X | `{}` | — |
| `openCourseConfirm` | X | `{ course }` | — |

> 향후 예약(지금 호출 안 함): `startRun`, `openOSSettings`, `pickProfilePhoto`, `share`, `openExternalUrl`.

## 이벤트 (네이티브 발행 → 웹 구독)

| event | payload | 비고 |
|---|---|---|
| `sessionChanged` | `{ status, session?, token? }` | 로그인/로그아웃/만료 시. `status`는 `"authenticated"` 또는 `"unauthenticated"` |

> `runCompleted`, `runCancelled`, `permissionChanged` 는 다음 라운드.

---

## 타입

```ts
type AuthProvider     = 'kakao' | 'apple';
type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'undetermined';

interface AppSession { userId: string; displayName?: string; expiresAt?: string }
// token은 session에 넣지 말고 별도 필드(login 응답·sessionChanged)로 전달

interface Course {
  id: string; title: string; description: string;
  distanceKm: number; estimatedTime: string;
  previewImageUrl: string; regionCode: string;
}
```

---

## iOS 예시 (WKWebView)

```swift
// 1) 주입 (atDocumentStart)
let js = """
window.DallYeoBridge = {
  postMessage: (m) => window.webkit.messageHandlers.dallyeo.postMessage(m)
};
"""
userContentController.addUserScript(
  WKUserScript(source: js, injectionTime: .atDocumentStart, forMainFrameOnly: true)
)
userContentController.add(self, name: "dallyeo")

// 2) 웹 → 네이티브 수신
func userContentController(_ uc: WKUserContentController, didReceive msg: WKScriptMessage) {
  guard let s = msg.body as? String, let d = s.data(using: .utf8),
        let req = try? JSONSerialization.jsonObject(with: d) as? [String: Any],
        let method = req["method"] as? String else { return }
  let id = req["id"] as? String
  switch method {
  case "login": /* OAuth 후 */ resolve(id, ["session": ..., "token": ...])
  case "openCourseSearch": presentSearch()   // 단방향
  // ...
  }
}

// 3) 응답
func resolve(_ id: String?, _ data: Any?) {
  guard let id else { return }
  let p: [String: Any] = ["id": id, "ok": true, "data": data ?? NSNull()]
  let json = String(data: try! JSONSerialization.data(withJSONObject: p), encoding: .utf8)!
  webView.evaluateJavaScript("window.__dallyeoBridgeResolve(\(json));")
}
```

> Android는 `@JavascriptInterface`(웹→네이티브) + `evaluateJavascript`(네이티브→웹)로 동일하게.

---

## 주의할 점

- `window.DallYeoBridge` 는 **웹 번들 로드 전(atDocumentStart)** 에 주입.
- `id` 있는 요청은 **반드시 resolve/reject** 호출. 안 하면 웹이 **10초 후 timeout** 처리.
- 로그인 취소는 `error.kind: "cancelled"` 로 응답 → 웹이 조용히 처리(에러 안 띄움). 그 외 실패는 다른 값.
- 토큰은 `session` 안에 넣지 말고 **별도 `token` 필드**로.
- 세션 만료/로그아웃은 `sessionChanged` 이벤트로 알려주면 웹 전체 인증 상태가 갱신됨.
- 동작 참고는 `src/shared/bridge/mockBridge.ts` (각 method가 어떤 값을 돌려주는지 그대로 있음).
- 디버깅: WKWebView `isInspectable = true` (iOS 16.4+) → Safari 웹 인스펙터.
