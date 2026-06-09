# U0 Foundation — NFR Design Plan

> CONSTRUCTION / NFR Design **Plan** (단위: U0 Foundation).
> 아래 **질문**에 `[Answer]:` 태그로 답해 주세요. 모두 채워지면 분석 후 산출물을 생성합니다.

---

## A. 범위

NFR Requirements를 **설계 패턴 + 논리 컴포넌트**로 구체화합니다.

- **N/A 처리(클라이언트 SPA — 정당화)**: 메시지 큐 · 분산 캐시 · 서킷 브레이커 · 오토스케일링 · 로드밸런서 등 서버/인프라 패턴은 본 레이어에 해당 없음(로컬 번들 SPA, 인프라는 백엔드/네이티브 소유 — Infrastructure Design도 SKIP).
- **설계 대상(프론트 NFR 패턴)**: 에러 경계, async 호출 회복력(재시도/타임아웃), 환경/데이터소스 토글, host page 보안 헤더, 테스트 구조.
- 출력(필수 산출물):
  - [x] `nfr-design-patterns.md` — 적용 설계 패턴
  - [x] `logical-components.md` — NFR 관련 논리 컴포넌트

---

## B. 질문 (모두 `[Answer]:`에 답해 주세요)

## Question 1 — 에러 경계(Error Boundary) 전략
런타임 렌더 에러 + 비동기 에러를 어떻게 잡을까요?

A) **전역 Error Boundary(앱 루트) + 라우트별 경계 + 데이터 로딩은 AsyncBoundary(U3 도입)** 3단 — 한 화면 에러가 앱 전체를 깨지 않음 — **추천**
B) 전역 Error Boundary 1개만
C) 화면별 개별 try/catch (경계 미사용)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2 — 비동기 호출 회복력 (API + 브릿지)
TanStack Query(API)와 브릿지 호출의 재시도/타임아웃 정책은?

A) **API: 쿼리 재시도 1회 + 지수백오프, 변이(mutation) 재시도 0 / 브릿지: 타임아웃(예: 10s) 후 reject, 자동 재시도 없음(사용자 재시도)** — **추천**
B) 재시도 없음(즉시 실패 노출)
C) 공격적 재시도(API 3회+, 브릿지 재시도 포함)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3 — 환경 / 데이터소스 토글 (mock ↔ 실제)
백엔드 부분 준비(NFR-DATA-01) + mock 브릿지 전환을 어떻게 설계할까요?

A) **빌드/런타임 env 플래그로 토글** — `VITE_*` 환경변수로 (MSW on/off, mock bridge on/off, API base URL) 전환. 디바이스=실브릿지, 브라우저=mock 자동 감지 — **추천**
B) 코드 상수 직접 수정(수동 전환)
C) 엔드포인트별 개별 토글(준비된 것만 실연동)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4 — Host Page 보안 헤더 / 무결성 (SECURITY-04/13)
WebView가 로드하는 로컬 번들의 보안 헤더(CSP 등) 정책은?

A) **기본 CSP/메타 보안 설정을 index.html에 명시 + 외부 리소스 최소화(정적 이미지 URL 화이트리스트 가이드), 강한 정책은 네이티브 WebView 설정과 후속 협의** — **추천**
B) 클라이언트는 미설정, 전적으로 네이티브 WebView 설정에 위임
C) 엄격 CSP 지금 전면 적용
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5 — 테스트 구조(논리 컴포넌트)
테스트 파일/도구를 어떻게 배치할까요?

A) **소스 코로케이션**(`*.test.ts`를 대상 파일 옆) + domain 로직은 property+example 병행 + 공용 fast-check arbitraries 모듈 — **추천**
B) 별도 `__tests__`/`tests` 디렉터리 집중
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## C. 답변 후 진행
- 5개 `[Answer]:`가 모두 채워지면 "완료" 등으로 알려주세요.
- 모호함 분석 후 필요 시 추가 질문 → 없으면 산출물 생성.
