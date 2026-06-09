# Requirements — Login · V01 · V02 (Round 1)

> Requirements Analysis 단계 산출물. 사용자 승인 후 User Stories 단계로 진입합니다.

## Intent Analysis

| 항목 | 값 |
|---|---|
| User Request | "Using AI-DLC, Login·V01, V02부터 시작할게" |
| Request Type | **New Feature** (greenfield, 첫 단위 구축) |
| Scope Estimate | **Multiple Components** — 3개 화면 + 공통 셸/브릿지/API 인프라 |
| Complexity | **Moderate** — UI 다수, 네이티브 브릿지 async, mock 백엔드 혼용 전략 |
| 작업 범위 | Login + V01(온보딩) + V02(메인뷰) |
| 우선순위 | A (CLAUDE.md MVP1 최우선) |

---

## Functional Requirements

### FR-LOGIN — 로그인

| ID | 요구사항 | 출처 |
|---|---|---|
| FR-LOGIN-01 | MVP1은 **Kakao**와 **Apple** 두 제공자만 지원한다. Google 버튼은 미노출. | Q1=B |
| FR-LOGIN-02 | 로그인 화면은 **하단 바텀시트** 형태로 표시한다 (별도 라우트 아님, 풀스크린 모달 아님). | Q2=C |
| FR-LOGIN-03 | 로그인 바텀시트는 비로그인 사용자가 게이트된 액션을 시도할 때 **자동으로** 표시된다. 게이트 액션 예시: 기록 탭 진입, 마이페이지 프로필 카드/내정보수정/계정관리 항목 접근, V10 완주 결과 저장 시도. | Q3=A |
| FR-LOGIN-04 | 마이페이지(V13)에서 비로그인 상태일 때 화면 **상단에 "로그인하세요" 배너**를 표시. 배너 탭 시 FR-LOGIN-02의 바텀시트가 열린다. | Q3 자유 기술 |
| FR-LOGIN-05 | 로그인 버튼 탭은 `bridge.login(provider)`만 호출한다. 웹은 OAuth 핸드셰이크를 **절대** 직접 수행하지 않는다. 응답으로 `AppSession`을 받는다. | CLAUDE.md 절대 규칙 |
| FR-LOGIN-06 | 세션 무효화 (401 응답 또는 네이티브 `sessionChanged` 이벤트의 logout 상태) 발생 시: ① 클라이언트 세션 상태 초기화 ② **V02 메인뷰로 라우팅** ③ **토스트**로 "로그아웃되었습니다" 안내. | Q8=A |

### FR-V01 — 온보딩

| ID | 요구사항 | 출처 |
|---|---|---|
| FR-V01-01 | 앱 최초 실행 시 온보딩 플로우가 한 번 표시된다. 완료 또는 건너뛰기 후에는 **다시는 표시되지 않는다** (신체 정보 수정은 V13 설정에서). | Q4=A |
| FR-V01-02 | 온보딩 단계: ① 서비스 소개 → ② 위치 권한 안내 → ③ 기본 정보 입력. | 기능명세서 V01 |
| FR-V01-03 | 위치 권한 단계는 `bridge.requestPermission('location')` 호출. 거부되어도 다음 단계로 진행 가능하며 제한 기능 안내 표시. | 기능명세서 V01 L36 |
| FR-V01-04 | 기본 정보 입력 필드: 키 / 체중 / 성별. | 기능명세서 V01 L37 |
| FR-V01-05 | **키 입력**: 정수, 최대 3자리. 4자리 이상 또는 비정수 입력 차단. | 기능명세서 V01 |
| FR-V01-06 | **체중 입력**: 정수, 2~3자리. 1자리 또는 4자리 이상 입력 차단. | 기능명세서 V01 |
| FR-V01-07 | **성별 입력 옵션**: 남 / 여 / 기타 / 선택안함 4가지 중 택1. | Q5=C |
| FR-V01-08 | "건너뛰기" 버튼은 기본 정보를 미입력 상태로 V02 메인뷰로 이동시킨다. | 기능명세서 V01 L39 |
| FR-V01-09 | "입력 완료" 버튼은 키·체중·성별 3개 항목이 모두 채워졌을 때만 활성화. 활성 시 V02 메인뷰로 이동. | 기능명세서 V01 L40 |

### FR-V02 — 메인뷰

| ID | 요구사항 | 출처 |
|---|---|---|
| FR-V02-01 | 메인 화면 진입 시 표시 요소: 추천 코스 카드 리스트, 지역 선택기, "코스 만들기" 진입 버튼, 하단 탭바. | 기능명세서 V02 |
| FR-V02-02 | 하단 탭바는 **메인 / 기록 / 마이페이지** 3개 탭으로 구성. 업적 탭 제외 (V14는 MVP3 + 기획 보류). | CLAUDE.md, 기능명세서 V02 |
| FR-V02-03 | "기록" 탭: 비로그인 사용자가 탭 시 로그인 바텀시트(FR-LOGIN-02)가 열린다 (V11으로 이동 차단). 로그인 상태면 V11 기록뷰로 이동. | Q3 + 기능명세서 V02 |
| FR-V02-04 | "마이페이지" 탭: 자유 진입 가능 (V13 설정뷰 표시). 비로그인 시 ① 상단에 FR-LOGIN-04 배너 표시 ② 프로필 카드 / 내정보수정 / 계정관리 항목은 비활성화 + 탭 시 로그인 바텀시트 오픈. | Q3 + 기능명세서 V13 L237, L247 |
| FR-V02-05 | "코스 만들기" 버튼 → `bridge.openCourseSearch()` 호출 (네이티브 V04 검색뷰로 전환). | CLAUDE.md, 기능명세서 V02 L49 |
| FR-V02-06 | 추천 코스 카드 본문 영역 탭 → `bridge.openCourseConfirm(course)` 호출 (네이티브 V08 코스 확인뷰로 전환). | 기능명세서 V02 L50 |
| FR-V02-07 | 추천 코스 카드 i-버튼 → 팝업으로 코스 설명 + **정적 경로 미리보기 이미지** 표시. 지도 SDK 사용 금지. | CLAUDE.md V02 + 기능명세서 V02 L51 |
| FR-V02-08 | 지역 선택기: MVP1은 **군산만** 표시. 선택 UI는 노출하되 실제 선택지는 없음 (미래 확장을 위한 자리 마련). 기본값 군산. | Q6=A, 기능명세서 V02 L52 |

---

## Non-Functional Requirements

### NFR-DATA — 데이터 & 백엔드
- **NFR-DATA-01**: 백엔드 준비도는 **부분(Partial)**. 준비된 엔드포인트는 실 연동, 미준비 엔드포인트는 **MSW(Mock Service Worker)** mock으로 가짜 응답. 어떤 엔드포인트가 준비됐는지의 구체적 목록은 다음 단계(Workflow Planning 또는 Application Design)에서 백엔드 팀과 합의하여 확정. (Q7=B)
- **NFR-DATA-02**: 지역(region) 데이터 모델은 **다중 지역으로 확장 가능**해야 한다. "군산"을 enum/literal로 하드코딩 금지. `regionCode: string` 필드 + 백엔드 또는 mock에서 지원 지역 목록을 동적으로 조회할 수 있는 구조 유지. (Q6 자유 기술)
- **NFR-DATA-03**: 모든 HTTP 호출은 단일 typed API 클라이언트(`shared/api/`)를 거친다. 세션 토큰은 매 요청 `Authorization: Bearer <token>` 헤더로 전송. localStorage / cookies / IndexedDB에 토큰 저장 금지. (CLAUDE.md, SECURITY-12)

### NFR-AUTH — 인증
- **NFR-AUTH-01**: OAuth 핸드셰이크는 절대 WebView 내부에서 수행하지 않는다. 웹은 `bridge.login(provider)`만 호출. (CLAUDE.md L106 — Google `disallowed_useragent` 차단 우회 목적)
- **NFR-AUTH-02**: 세션 토큰의 단일 출처는 **네이티브**. 네이티브가 Keychain/Keystore에 보관, 브릿지를 통해 웹에 주입. 웹은 메모리에만 보관하고 영속화하지 않는다. (CLAUDE.md, SECURITY-12)
- **NFR-AUTH-03**: 네이티브 `sessionChanged` 이벤트는 web 측 인증 도메인 모듈(`features/auth/` 또는 `shared/auth/`)의 단일 구독자에서만 처리. 모든 화면의 인증 상태는 이 단일 출처(single source of truth)에서 파생. (SECURITY-11 — Security-critical 로직 분리)

### NFR-BRIDGE — 네이티브 ↔ 웹 브릿지
- **NFR-BRIDGE-01**: `window.DallYeoBridge` 단일 추상화. 플랫폼별 구현(iOS WKScriptMessageHandler / Android `@JavascriptInterface`)을 화면 코드에서 직접 참조하지 않는다.
- **NFR-BRIDGE-02**: 모든 브릿지 호출은 request-id + promise registry 패턴으로 비동기 응답 처리.
- **NFR-BRIDGE-03**: 브라우저 단독 개발용 **mock bridge** 제공. Login·V01·V02 모든 화면은 디바이스 없이 일반 브라우저에서 풀-미리보기 가능해야 한다.

### NFR-WEBVIEW — WebView 호환성
- **NFR-WEBVIEW-01**: 뷰포트 단위는 `100dvh` 사용 (`100vh` 금지). `env(safe-area-inset-*)` + `viewport-fit=cover` 적용.
- **NFR-WEBVIEW-02**: overscroll-bounce, long-press callout, tap-highlight 비활성화.
- **NFR-WEBVIEW-03**: 소프트 키보드 인셋 처리 — 고정 하단 탭바가 키보드 위로 튀어 오르지 않도록.
- **NFR-WEBVIEW-04**: iOS 좌측 스와이프 뒤로가기 제스처 미차단. 로그인 바텀시트를 포함한 모든 모달/시트는 브라우저 history 엔트리로 관리되어 좌측 스와이프로 닫힌다.

### NFR-UI — UI & 디자인 토큰
- **NFR-UI-01**: **Lo-Fi First**. 모든 색상·타이포·간격·반경은 Tailwind theme + CSS 변수의 **디자인 토큰**으로만 정의. 화면 코드에 raw HEX/px 값 하드코딩 금지. 추후 디자인 적용 시 토큰 파일만 수정.
- **NFR-UI-02**: 모든 사용자 노출 텍스트는 **한국어**. 코드 식별자(변수/함수/타입/파일명)는 영어. (CLAUDE.md 강제 규칙)

### NFR-EXT — Extension Configuration
- **NFR-EXT-SECURITY**: Security Baseline 익스텐션 **Enabled (Full enforcement)**. SECURITY-01~15 규칙 전체가 blocking constraint. 각 후속 단계(Functional Design, NFR Design, Code Generation, Build and Test)에서 적용 가능 규칙별 compliance를 검증하고 stage completion summary에 명시.
- **NFR-EXT-PBT**: Property-Based Testing 익스텐션 **Enabled (Full enforcement)**. PBT-01~10 규칙 전체가 blocking constraint.
  - Functional Design에서 testable properties 식별 의무 (PBT-01)
  - NFR Requirements에서 PBT 프레임워크 선정 의무 (PBT-09) — 후보 1순위: **fast-check** (TS/Vitest 통합)
  - Code Generation에서 PBT 테스트 + example-based 테스트 병행 작성 의무 (PBT-10)

---

## Out of Scope (이번 라운드)
- V03~V09 — 네이티브 소유, 본 라운드에 절대 구현 금지
- V10 완주결과, V11 기록, V12 기록상세, V13 설정 본체, V14 업적의 **구현** (V13의 "로그인하세요 배너"는 FR-LOGIN-04로 일부 포함)
- 실 OAuth SDK 통합 — 네이티브 책임
- 실 디자인 적용 — Lo-Fi 토큰만
- Google 로그인 — MVP1 제외, 후속
- 백엔드 엔드포인트 스펙 확정 — 다음 단계(Workflow Planning 또는 Application Design)에서 백엔드 팀과 협의 후 결정

---

## Extension Compliance Summary (Requirements Analysis 단계)

이 단계에서 검증 가능한 규칙만 평가했습니다. 나머지는 적용 가능 단계로 deferred.

### Security Baseline

| 규칙 | 단계 적용 | 비고 |
|---|---|---|
| SECURITY-01 (Encryption at rest/in transit) | N/A | 백엔드 책임. 클라이언트에 영속 저장소 없음. |
| SECURITY-02 (Network 액세스 로깅) | N/A | 백엔드/인프라 책임. |
| SECURITY-03 (App-level logging) | Deferred → NFR Design | 클라이언트 로깅 정책은 후속 단계에서. |
| SECURITY-04 (HTTP 보안 헤더) | Deferred → Code Gen | WebView host page의 헤더 정책은 후속. |
| SECURITY-05 (Input validation) | **Compliant** | FR-V01-05/06으로 키/체중 input validation 명시. |
| SECURITY-06 (Least-privilege IAM) | N/A | 클라이언트 측 IAM 없음. |
| SECURITY-07 (Network 설정) | N/A | 백엔드/인프라 책임. |
| SECURITY-08 (App-level access control) | **Compliant** | FR-LOGIN-03 + FR-V02-03/04로 게이트 정의. 모든 게이트는 클라이언트에서 차단하되 서버 인가 검증과 이중 방어. |
| SECURITY-09 (Hardening) | Deferred → Build and Test | |
| SECURITY-10 (공급망 보안) | Deferred → NFR Design | 의존성 락/스캐너는 프로젝트 셋업 시점. |
| SECURITY-11 (Secure design) | **Compliant** | NFR-AUTH-03 — 인증 모듈 단일 출처로 분리. |
| SECURITY-12 (Auth/credential mgmt) | **Compliant** | NFR-AUTH-01/02 + NFR-DATA-03 — 토큰 비저장, MFA는 OAuth IdP 책임. |
| SECURITY-13 (무결성 검증) | Deferred → NFR Design / Code Gen | 외부 스크립트 SRI 등은 후속. |
| SECURITY-14 (Alerting/monitoring) | N/A → 백엔드 책임 | 클라이언트 알람은 후속. |
| SECURITY-15 (예외 처리/fail-safe) | Deferred → NFR Design / Code Gen | 에러 핸들링 패턴은 코드 패턴 정의 시점. |

→ **현 단계 블로킹 finding 없음.** 4개 규칙 Compliant, 6개 Deferred, 5개 N/A.

### Property-Based Testing

| 규칙 | 단계 적용 | 비고 |
|---|---|---|
| PBT-01 (Property identification) | Deferred → Functional Design | 각 unit별 testable property 식별 의무. |
| PBT-02 (Round-trip) | Deferred → Code Gen | 직렬화/디코딩 페어 식별 시점에. |
| PBT-03~PBT-08 | Deferred → Functional Design / Code Gen / Build and Test | |
| PBT-09 (Framework selection) | Deferred → NFR Requirements | 후보 1순위: **fast-check** (TS/Vitest 통합). |
| PBT-10 (Complementary strategy) | Deferred → Code Gen | example-based + PBT 병용 의무. |

→ **현 단계 블로킹 finding 없음.** Requirements 단계에서 적용 가능한 PBT 규칙 없음 (전 항목 후속 단계로 deferred).

---

## Key Requirements Summary

달여(DallYeo) WebView SPA에 다음을 구축한다:

- **Kakao/Apple 소셜 로그인** — 하단 바텀시트, 게이트 액션 트리거 + 마이페이지 상단 "로그인하세요" 배너, 네이티브 `bridge.login()` 위임
- **V01 온보딩** — 일회성 (위치 권한 + 키/체중/성별 입력, 4-옵션 성별, 건너뛰기 허용)
- **V02 메인뷰** — 메인/기록/마이페이지 3-탭바 + 군산 한정 추천 코스 카드 (정적 경로 미리보기) + `bridge.openCourseSearch/openCourseConfirm` 호출

Lo-Fi 디자인 토큰 기반, MSW + 실 백엔드 혼용, 세션은 네이티브 단일 출처. **Security Baseline + PBT 전체 강제** 환경에서 진행.
