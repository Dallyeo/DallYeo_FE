# U1 Login — NFR Requirements

> CONSTRUCTION / NFR Requirements 산출물 (단위: U1). U0 전역 NFR 상속 + U1 고유.

---

## 1. 보안 (Security — 인증 핵심)
- **NFR-U1-SEC-12a**: Bearer 토큰은 `apiClient` 모듈 스코프 클로저에만 보관. 외부에 `setToken/clearToken/getAuthHeader`만 노출, 토큰 값 직접 getter 미제공. localStorage/cookie/IndexedDB/Zustand persist 금지. (Q1=A, SECURITY-12)
- **NFR-U1-SEC-12b**: OAuth 핸드셰이크 웹 미수행 — `bridge.login` 위임만. (NFR-AUTH-01)
- **NFR-U1-SEC-11**: 인증 상태 단일 출처(sessionStore) + 단일 조율자(SessionService). sessionChanged 단일 구독. (NFR-AUTH-03)
- **NFR-U1-SEC-08**: 게이트 결정은 gateRules(U0) 재사용. 클라 차단 + 서버 인가 이중방어.
- **NFR-U1-SEC-03**: 클라 로깅은 개발 콘솔만, **토큰·세션 식별자 등 민감정보 미로깅**. 원격 수집은 훅 자리만(후속). (Q2=A)

## 2. 신뢰성 (Reliability)
- **NFR-U1-REL-01**: 브릿지 호출 10s 타임아웃 + registry 정리(누수 방지). 자동 재시도 없음(사용자 재시도). (P-2)
- **NFR-U1-REL-02**: 세션 무효화는 401/sessionChanged 합류 시 **1회**만 부수효과(중복 가드). (BR-U1-4)
- **NFR-U1-REL-03**: 로그인 취소/실패 구분 — 취소 시 무해(상태 불변), 실패 시 안내+재시도. (BR-U1-2)

## 3. 성능 (Performance)
- **NFR-U1-PERF-01**: 로그인 시트는 경량(버튼만). 인증 인프라 추가가 번들 목표(<300KB gzip) 내 유지(U0 PERF 상속).

## 4. 사용성 (Usability / WebView)
- **NFR-U1-WV-01**: 로그인 바텀시트는 history 엔트리 — 좌측 스와이프 뒤로가기로 닫힘. (NFR-WEBVIEW-04)
- **NFR-U1-WV-02**: 디바이스 없는 브라우저에서 mock 브릿지로 전 분기(성공/취소/실패) 미리보기 가능. (NFR-BRIDGE-03)

## 5. 테스트 (PBT 포함)
- **NFR-U1-TEST-01**: U1은 **example 기반** 중심 — 컴포넌트(Testing Library), 로직(unit). (Q3=B)
- **NFR-U1-TEST-02 (PBT-10)**: property 신규 식별 없음 — 도메인 불변식은 U0 property 테스트가 커버. U1 상태전이(loginSheet)·무효화 가드는 example로 경계/멱등 확인.
- **NFR-U1-TEST-03**: 브릿지/세션은 mock 기반 통합 테스트.

---

## 6. Extension Compliance Summary — U1 NFR Requirements

### Security Baseline
| 규칙 | 적용 | 비고 |
|---|---|---|
| SECURITY-08 | Compliant | gateRules 재사용 |
| SECURITY-11 | Compliant | sessionStore/SessionService 단일 |
| SECURITY-12 | Compliant | 토큰 클로저 캡슐화, OAuth 위임 |
| SECURITY-03 | Partial | 콘솔 로깅, 민감정보 미로깅; 원격은 후속 |
| SECURITY-15 | Compliant | 취소/실패/타임아웃 예외 처리 |

### Property-Based Testing
| 규칙 | 적용 | 비고 |
|---|---|---|
| PBT-01 | N/A(U1) | 신규 property 대상 없음(U0 커버) — 사용자 결정 Q3=B |
| PBT-10 | Compliant | example 기반 보완 전략 충족 |
| PBT-08/09 | Inherited | U0 설정 상속(seed/numRuns/fast-check) |

→ **블로킹 finding 없음.**
