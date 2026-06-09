# U2 Onboarding — Logical Components (NFR)

> 단위: U2.

| 컴포넌트 | 위치 | NFR 책임 | 패턴 |
|---|---|---|---|
| `onboardingRepository` | features/onboarding/api | localStorage 캡슐화 + 폴백 | U2-P1/P3 |
| `onboardingStore` | features/onboarding/model | step + 입력 state | — |
| `useOnboarding` | features/onboarding/model | 검증/권한/완료 조율 | U2-P2/P3 |
| `OnboardingGate`(RootLayout 내) | app | 미완료 리다이렉트 | U2-P4 |
| BridgeService.requestPermission | shared/services | 권한(U1 BridgeService 확장) | U2-P3 |

## 회복 시나리오
| 상황 | 처리 |
|---|---|
| localStorage 불가 | completed=false 폴백, 저장 무시(비차단) |
| 권한 거부 | 진행 + 안내 |
| 잘못된 입력 | 하드 차단 + 버튼 비활성 |

## 검증
- [x] NFR 패턴 컴포넌트 대응 / 인프라성 N/A / Mermaid 미사용
