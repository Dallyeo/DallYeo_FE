# Components — Login · V01 · V02

> Application Design 산출물. 고수준 컴포넌트 식별 + 책임 + 인터페이스 정의.
> 상세 비즈니스 룰은 Construction의 Functional Design에서. 결정 사항: TanStack Query(서버상태) · Zustand(전역 클라이언트 상태) · React Router(라우팅) · 도메인별 Repository · 혼합 브릿지 경계 · 공용 AsyncBoundary.

레이어 의존 방향: **presentation → application(hooks) → domain ← data**. domain은 무엇에도 의존하지 않음.

---

## 1. Domain Layer (`src/domain/`)

도메인 타입(백엔드·네이티브와의 계약) + 순수 로직. 외부 의존 없음.

### 1.1 도메인 타입 (`domain/types/`)
| 타입 | 정의 (요약) | 출처 |
|---|---|---|
| `AppSession` | `{ userId: string; displayName?: string; expiresAt?: string }` (토큰은 메모리 보관, 네이티브 단일 출처) | FR-LOGIN-05, NFR-AUTH-02 |
| `AuthStatus` | `'authenticated' \| 'unauthenticated' \| 'unknown'` | LOGIN-S4 |
| `AuthProvider` | `'kakao' \| 'apple'` (MVP1, google 제외) | FR-LOGIN-01 |
| `Gender` | `'male' \| 'female' \| 'other' \| 'unspecified'` | FR-V01-07 |
| `OnboardingProfile` | `{ heightCm?: number; weightKg?: number; gender?: Gender }` | FR-V01-04~07 |
| `OnboardingState` | `{ completed: boolean; profile?: OnboardingProfile }` | FR-V01-01 |
| `PermissionType` | `'location' \| 'notification'` | FR-V01-03 |
| `PermissionStatus` | `'granted' \| 'denied' \| 'blocked' \| 'undetermined'` | FR-V01-03 |
| `Region` | `{ code: string; name: string }` (code는 string, 하드코딩 금지) | FR-V02-08, NFR-DATA-02 |
| `Course` | `{ id; title; description; distanceKm; estimatedTime; previewImageUrl; regionCode }` | FR-V02-01/06/07 |
| `SharePayload` | `{ title?: string; text?: string; url?: string }` | 브릿지 share |
| `RunResult` | (V10용 placeholder — 본 라운드 미구현, 타입만 예약) | CLAUDE.md |
| `GateAction` | `'recordsTab' \| 'myPageProfile' \| 'myPageEditInfo' \| 'myPageAccount' \| 'saveRunResult'` | FR-LOGIN-03 |

### 1.2 순수 로직 (`domain/logic/`)
| 컴포넌트 | 책임 |
|---|---|
| `profileValidation` | 키(정수·≤3자리)/체중(정수·2~3자리) 검증, "3항목 충족 ⇔ 입력완료 활성" 판정. **PBT 대상** (FR-V01-05/06/09, SECURITY-05) |
| `sessionLogic` | AuthStatus 상태 전이 규칙(login/logout/expire) 순수 함수. **PBT 대상** (LOGIN-S4) |
| `gateRules` | (AuthStatus × GateAction/탭) → 허용/차단 결정. **PBT 대상** (FR-V02-03/04, SECURITY-08) |
| `regionLogic` | 지원 지역 목록에서 기본 지역(군산) 선택·유효성. **PBT 대상** (FR-V02-08) |

---

## 2. Data Layer (`src/shared/data/`, `src/features/*/api/`)

도메인 Repository **인터페이스**(domain/repositories에 선언)와 그 구현(HTTP/브릿지/mock). UI는 인터페이스에만 의존.

### 2.1 Repository 인터페이스 (도메인별, `domain/repositories/`)
| 컴포넌트 | 책임 | 데이터 출처 |
|---|---|---|
| `AuthRepository` | 로그인(→AppSession)/로그아웃/현재 세션 조회 | **브릿지**(login/logout) + 백엔드(프로필) |
| `CourseRepository` | 추천 코스 목록/상세 조회 | 백엔드(MSW mock 혼용) |
| `RegionRepository` | 지원 지역 목록 조회 | 백엔드(MSW mock 혼용) |
| `OnboardingRepository` | 온보딩 완료 상태/프로필 저장·조회 | 백엔드(로그인 시) + 로컬(비로그인 임시) |
| `RunResultRepository` | (V10 placeholder, 미구현) | — |

> Q5 혼합 경계: `AuthRepository.login`은 내부적으로 `bridge.login`을 호출하지만 UI에는 데이터 계약(Repository)으로 노출. 화면 전환/디바이스 액션은 Repository가 아닌 `BridgeService`(서비스 계층)로 분리 — `services.md` 참조.

### 2.2 인프라 컴포넌트 (`shared/`)
| 컴포넌트 | 책임 |
|---|---|
| `apiClient` | 단일 typed HTTP 클라이언트. base URL 설정 가능, `Authorization: Bearer` 자동 주입, 401 인터셉트→세션 무효화 신호. (NFR-DATA-03, SECURITY-12) |
| `queryClient` | TanStack Query 클라이언트 설정(캐시/재시도/무효화 정책) |
| `bridgeAdapter` | `window.DallYeoBridge` 접근 + request-id/promise registry. 플랫폼 구현 직접 참조 금지. (NFR-BRIDGE-01/02) |
| `mockBridge` | 브라우저 단독 개발용 mock 브릿지(비동기 모사). (NFR-BRIDGE-03) |
| `mswHandlers` | 백엔드 미준비 엔드포인트 mock. (NFR-DATA-01) |

---

## 3. Application Layer (`src/features/*/model/`)

화면별 훅/상태. domain·data에 의존, presentation에 데이터/액션 제공.

| 컴포넌트 | 책임 | 사용 스토어/쿼리 |
|---|---|---|
| `sessionStore` (Zustand) | **인증 단일 출처**. AuthStatus + AppSession 보관, sessionChanged 단일 구독, 401 무효화 처리. (NFR-AUTH-03, LOGIN-S4) |
| `useAuth` | sessionStore 구독 + login/logout 액션 노출 | sessionStore + AuthRepository |
| `loginSheetStore` (Zustand) | 로그인 바텀시트 open/close 상태(중복 방지), 트리거한 GateAction 기억 | — |
| `useGate` | (인증상태×액션) 게이트 판정 → 허용 또는 시트 오픈 | sessionStore + gateRules + loginSheetStore |
| `onboardingStore` (Zustand) | 온보딩 진행 단계 + 입력값 + 완료 플래그 | — |
| `useOnboarding` | 온보딩 단계 진행/검증/완료 처리 | onboardingStore + profileValidation + OnboardingRepository + BridgeService(권한) |
| `useRecommendedCourses` | 추천 코스 목록 조회(로딩/에러/빈 상태) | TanStack Query + CourseRepository |
| `useRegions` / `useSelectedRegion` | 지역 목록 + 선택 상태(기본 군산) | TanStack Query + RegionRepository + regionLogic |

---

## 4. Presentation Layer (`src/features/*/ui/`, `src/app/`, `src/shared/ui/`)

순수 표현. 비즈니스 로직 없음(훅에서 주입받음). Lo-Fi 디자인 토큰만 사용(NFR-UI-01).

### 4.1 App Shell (`src/app/`)
| 컴포넌트 | 책임 |
|---|---|
| `AppRoot` | Providers(QueryClientProvider, Router) + 전역 셸 + sessionChanged 구독 부트스트랩 |
| `AppRouter` | React Router 라우트 정의(온보딩/메인/기록/마이페이지), 시트·모달=history 엔트리 (NFR-WEBVIEW-04) |
| `BottomTabBar` | 메인/기록/마이페이지 3탭. 탭 클릭 시 useGate 경유. (FR-V02-02) |
| `SafeAreaLayout` | 100dvh + safe-area-inset + overscroll/long-press/tap-highlight 비활성 (NFR-WEBVIEW-01~03) |

### 4.2 공용 UI (`src/shared/ui/`)
| 컴포넌트 | 책임 |
|---|---|
| `AsyncBoundary` | 로딩/에러/빈 상태 + 재시도 슬롯 표준화, TanStack Query 상태 연동 (Q6=A, SECURITY-15) |
| `BottomSheet` | history 엔트리 기반 바텀시트(좌측 스와이프로 닫힘) (NFR-WEBVIEW-04) |
| `uiKit` | 토큰 기반 Button/Input/Card/Toast/Banner 등 Lo-Fi 기본 요소 |

### 4.3 Feature 화면
| Feature | 주요 UI 컴포넌트 | 스토리 |
|---|---|---|
| `login` | `LoginBottomSheet`(Kakao/Apple 버튼), `LoginBanner`(마이페이지 상단) | LOGIN-S1/S2/S3 |
| `onboarding` (V01) | `OnboardingFlow`, `ServiceIntroStep`, `LocationPermissionStep`, `BodyInfoStep`(키/체중/성별+검증) | V01-S1~S4 |
| `main` (V02) | `MainView`, `RecommendedCourseList`, `CourseCard`, `CoursePreviewPopup`(i-버튼·정적이미지), `RegionSelector`, `CreateCourseButton` | V02-S1~S5 |
| `settings` (V13, 부분) | `MyPagePlaceholder` + `LoginBanner` 호스팅(비로그인) | LOGIN-S3, FR-V02-04 |

---

## 5. 컴포넌트 인터페이스 요약 (계약)

- **UI ↔ 데이터**: UI/훅은 Repository 인터페이스 + BridgeService 인터페이스에만 의존. "백엔드 vs 브릿지 vs mock" 구분 비노출. (CLAUDE.md Repository 원칙)
- **인증 단일 출처**: 모든 화면의 인증 상태는 `sessionStore`에서 파생. 직접 토큰 접근 금지. (NFR-AUTH-03)
- **브릿지 추상화**: 화면 코드는 `BridgeService`/Repository만 호출, `window.DallYeoBridge` 직접 접근 금지. (NFR-BRIDGE-01)

상세 메서드 시그니처는 `component-methods.md` 참조.
