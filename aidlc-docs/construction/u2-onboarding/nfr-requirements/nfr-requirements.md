# U2 Onboarding — NFR Requirements

> 단위: U2. U0/U1 전역 NFR 상속 + U2 고유.

## 고유 NFR
- **NFR-U2-SEC-01**: localStorage에는 **비민감 데이터만**(온보딩 완료 플래그, 신체정보). 토큰·자격증명 저장 금지(SECURITY-12 일관). 신체정보는 개인정보지만 디바이스 로컬 한정, 백엔드 동기화는 후속 합의.
- **NFR-U2-SEC-05**: 키/체중 입력 검증은 U0 profileValidation 하드 규칙 재사용(SECURITY-05).
- **NFR-U2-REL-01**: localStorage 접근 실패(사파리 프라이빗 등) 시 completed=false로 폴백, 저장 실패는 비차단.
- **NFR-U2-WV-01**: 온보딩은 탭바 없는 풀스크린 플로우, safe-area 적용. 입력 시 소프트 키보드 인셋 고려.
- **NFR-U2-A11Y**: 입력 필드 inputMode=numeric, label 연결.

## 테스트 (PBT)
- **NFR-U2-TEST-01**: example 중심. 도메인 검증 property는 U0 커버(중복 생성 안 함).
- onboardingRepository round-trip + useOnboarding 전이 example 테스트.

## Compliance
- SECURITY-05 Compliant / SECURITY-12 Compliant(토큰 미저장) / SECURITY-15 Compliant(권한거부·저장실패 폴백) / PBT-10 Compliant(example). 블로킹 없음.
