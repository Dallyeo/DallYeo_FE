# U1 Login — Frontend Components

> CONSTRUCTION / Functional Design 산출물 (단위: U1). UI 컴포넌트 계층 + props/state + 상호작용 + 통합 지점.
> Q6=C: 마이페이지(LoginBanner 호스팅·게이트 항목)는 U3. U1은 로그인 시트 + 인증 동작 위주.

---

## 1. 컴포넌트 계층

```
(전역, AppRoot 하위)
LoginBottomSheetHost            // loginSheetStore.isOpen 구독, 열릴 때 시트 렌더
  └─ BottomSheet (shared/ui)    // history 엔트리 기반(NFR-WEBVIEW-04)
       └─ LoginBottomSheet      // 로그인 콘텐츠
            ├─ ProviderButton(kakao)
            ├─ ProviderButton(apple)
            └─ LoginErrorNotice  // LoginPhase==='error'일 때만(Q3=A)
```

> `LoginBanner`(마이페이지 상단) 및 게이트 항목 자리는 **U3에서 구현**(Q6=C). 본 단위에서는 reusable 컴포넌트도 생성하지 않음(불필요한 선행 방지).

---

## 2. 컴포넌트 명세

### LoginBottomSheetHost
- **역할**: 전역 호스트. `loginSheetStore.isOpen`이 true면 BottomSheet+LoginBottomSheet 렌더.
- **props**: 없음(store 구독).
- **state**: loginSheetStore(isOpen, pendingAction).
- **상호작용**: 뒤로/바깥 탭 → close(pendingAction=null).

### BottomSheet (shared/ui — U1에서 신규)
- **역할**: 하단 시트 컨테이너. 열림 시 history.pushState, 닫힘 시 back으로 정리(좌측 스와이프=닫힘, NFR-WEBVIEW-04).
- **props**: `isOpen: boolean`, `onClose: () => void`, `children`, `data-testid`.

### LoginBottomSheet
- **역할**: Kakao/Apple 버튼 + 에러 안내.
- **props**: 없음(useAuth/useLoginSheet 사용).
- **state(파생)**: `phase: LoginPhase`(idle/pending/error).
- **상호작용**:
  - Kakao 탭 → `data-testid="login-kakao-button"` → useAuth.login('kakao')
  - Apple 탭 → `data-testid="login-apple-button"` → useAuth.login('apple')
  - 성공 → 시트 닫힘 + 재개(Q2=B)
  - 취소 → idle 유지(에러 없음)
  - 실패 → LoginErrorNotice 노출 + 재시도

### ProviderButton
- **props**: `provider: AuthProvider`, `disabled`(pending 중), `onClick`.
- **data-testid**: `login-{provider}-button`.

### LoginErrorNotice
- **props**: `message: string`, `onRetry: () => void`.
- **data-testid**: `login-error-notice`, 재시도 버튼 `login-retry-button`.

---

## 3. 사용자 상호작용 흐름 (LOGIN-S1/S2)
```
(게이트 액션 발생, 트리거는 U3) -> loginSheetStore.open(action)
  -> LoginBottomSheetHost 렌더 -> 사용자 Kakao/Apple 선택
     pending(버튼 비활성/스피너)
     성공 -> 닫힘 + pendingAction 재개
     취소 -> idle 복귀(시트 유지)
     실패 -> 에러 안내 + 재시도
```

## 4. 폼/검증
- 로그인 화면은 **버튼만**(입력 폼 없음, FR-LOGIN-02). 검증 로직 없음.

## 5. API/브릿지 통합 지점
| 컴포넌트 | 통합 |
|---|---|
| LoginBottomSheet | useAuth.login → AuthRepository → BridgeService.login (브릿지) |
| 전역 | SessionService → sessionChanged/401 → sessionStore (모든 화면 인증상태 파생) |
| (백엔드 호출 없음) | 로그인은 브릿지 위임; 프로필 등 백엔드 조회는 본 단위 범위 아님 |

## 6. 자동화 친화 (data-testid)
- `login-bottom-sheet`, `login-kakao-button`, `login-apple-button`, `login-error-notice`, `login-retry-button`.
- 안정적 명명, 동적 ID 미사용.

## 7. 접근성/WebView
- 시트는 좌측 스와이프 뒤로가기로 닫힘(history 엔트리).
- 버튼 role/aria 적용, 스피너 aria-live.
