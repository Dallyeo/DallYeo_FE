# U0 Foundation — NFR Requirements

> CONSTRUCTION / NFR Requirements 산출물 (단위: U0). U0 및 전역 적용 비기능 요구.
> 기술 스택 결정은 `tech-stack-decisions.md` 참조.

---

## 1. 성능 (Performance)
- **NFR-U0-PERF-01**: 초기 JS 번들 gzip ≈ **<300KB** 목표(가이드, 엄격 측정 추후). (Q6=A)
- **NFR-U0-PERF-02**: 화면/탭 전환은 즉각적(체감 지연 최소). 로컬 번들이므로 네트워크 비의존.
- **NFR-U0-PERF-03**: 코드 스플리팅 여지 확보(라우트 기준), U0는 셸만이라 영향 적음.

## 2. 신뢰성 / 오류 처리 (Reliability)
- **NFR-U0-REL-01**: domain 순수 함수는 예외 던지지 않고 결정적 값 반환(검증=boolean, 폴백=유효값). (business-rules BR-4)
- **NFR-U0-REL-02**: regionLogic은 빈 목록에서도 안전 폴백(non-null). (BR-4.1)

## 3. 보안 (Security — Baseline 적용 규칙)
- **NFR-U0-SEC-05 (SECURITY-05 입력검증)**: profileValidation 하드 규칙으로 키/체중 입력 검증.
- **NFR-U0-SEC-08 (SECURITY-08 접근제어)**: gateRules로 액션 단위 게이트 결정(클라 차단 + 서버 이중방어).
- **NFR-U0-SEC-12 (SECURITY-12 자격증명)**: 토큰 타입은 AppSession에 미포함(메모리 보관 전제). U0는 영속 저장소 미사용.
- **NFR-U0-SEC-10 (SECURITY-10 공급망)**: `pnpm-lock.yaml` 커밋. 스캐너/audit 정책은 NFR Design에서 구체화.
- **NFR-U0-SEC-04/13 (헤더/무결성)**: WebView host page 헤더·외부 스크립트 정책 → NFR Design/Code Gen으로 deferred.

## 4. WebView 호환 (Usability)
- **NFR-U0-WV-01**: `100dvh` 사용(100vh 금지), `env(safe-area-inset-*)` + `viewport-fit=cover`. (NFR-WEBVIEW-01)
- **NFR-U0-WV-02**: overscroll-bounce / long-press callout / tap-highlight 비활성(전역 CSS). (NFR-WEBVIEW-02)
- **NFR-U0-WV-03**: 소프트 키보드 인셋 처리 기반 마련(고정 탭바). (NFR-WEBVIEW-03)
- **NFR-U0-WV-04**: iOS 좌측 스와이프 뒤로가기 미차단, 시트/모달=history 엔트리(라우터 정책). (NFR-WEBVIEW-04)

## 5. 유지보수성 (Maintainability)
- **NFR-U0-MNT-01**: TS strict + 추가 엄격 옵션. (Q4=A)
- **NFR-U0-MNT-02**: ESLint + Prettier 강제. (Q3=A)
- **NFR-U0-MNT-03**: FSD-lite 폴더 경계 + 레이어 의존 방향 준수(domain 무의존).
- **NFR-U0-MNT-04**: Lo-Fi 디자인 토큰만 사용(raw HEX/px 금지). (NFR-UI-01)

## 6. 테스트 / 품질 (PBT 포함)
- **NFR-U0-TEST-01 (PBT-10)**: domain 순수 함수 4종은 example-based + property-based 병행.
- **NFR-U0-TEST-02 (PBT-08)**: fast-check numRuns 100, CI 시드 고정(실패 재현). (Q5=A)
- **NFR-U0-TEST-03**: Vitest + Testing Library + jsdom 환경. (Q2=A)
- **NFR-U0-TEST-04 (PBT-01)**: business-logic-model의 11개 property 후보를 테스트로 구현(Code Gen).

## 7. 확장성 (Scalability — 클라이언트 관점)
- **NFR-U0-SCALE-01**: region 데이터 모델 다중 지역 확장 가능(regionCode:string, 동적 목록). (NFR-DATA-02)
- **NFR-U0-SCALE-02**: 단위 추가(U1~U3, 이후 V10 등) 시 U0 변경 최소화되도록 인터페이스 안정.

---

## 8. Extension Compliance Summary — U0 NFR Requirements 단계

### Security Baseline
| 규칙 | 적용 | 비고 |
|---|---|---|
| SECURITY-05 | Compliant | 입력검증 NFR 명시 |
| SECURITY-08 | Compliant | 게이트 NFR 명시 |
| SECURITY-10 | Partial→Deferred | lock 커밋 명시, 스캐너는 NFR Design |
| SECURITY-12 | Compliant | 토큰 비저장 전제 재확인 |
| SECURITY-04/13/15 | Deferred → NFR Design/Code Gen | 헤더/무결성/에러패턴 |
| 그 외 | N/A | 백엔드/인프라 책임 |

### Property-Based Testing
| 규칙 | 적용 | 비고 |
|---|---|---|
| PBT-08 (재현성) | **Compliant** | numRuns 100 + CI 시드 고정 |
| PBT-09 (프레임워크) | **Compliant** | fast-check 확정 |
| PBT-01/10 | Compliant(계획) | property 후보 + 병행 전략 명시, 구현은 Code Gen |
| PBT-02~07 | Deferred → Code Gen | |

→ **블로킹 finding 없음.**
