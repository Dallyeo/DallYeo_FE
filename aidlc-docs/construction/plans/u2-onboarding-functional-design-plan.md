# U2 Onboarding — Functional Design Plan (자동승인: 추천 채택)

> CONSTRUCTION / Functional Design (단위: U2 Onboarding V01). 자동승인 모드 — 아래 결정은 추천 기본값.

## 범위
- 스토리: V01-S1(1회 표시)·V01-S2(위치 권한)·V01-S3(기본정보+검증)·V01-S4(건너뛰기)
- U0 재사용: profileValidation, domain.types. U1 재사용: BridgeService(requestPermission).

## 결정 (자동승인 추천)
- [x] Q1 영속화: **localStorage**(완료 플래그+프로필, 비민감). 백엔드 동기화 후속. (`[Answer]: A`)
- [x] Q2 최초 실행 라우팅: RootLayout이 completed 확인 → 미완료 시 /onboarding 1회 리다이렉트. (`[Answer]: A`)
- [x] Q3 단계 모델: onboardingStore(intro→permission→bodyInfo). (`[Answer]: A`)
- [x] Q4 입력 UX: 하드(비정수/자릿수) 입력 차단 + 소프트 범위 경고(비차단) + isProfileComplete 시 제출 활성. (`[Answer]: A`)
- [x] Q5 권한 거부: 진행 허용 + 제한 안내. (`[Answer]: A`)

## 출력 산출물
- [x] domain-entities.md (보강) / [x] business-rules.md / [x] business-logic-model.md / [x] frontend-components.md
