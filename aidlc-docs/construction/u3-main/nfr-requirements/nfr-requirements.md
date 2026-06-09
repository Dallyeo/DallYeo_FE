# U3 Main — NFR Requirements

> 단위: U3. U0/U1 상속 + 고유.

## 고유 NFR
- **NFR-U3-DATA-01**: 코스/지역은 apiClient 경유. 백엔드 미준비 시 MSW mock(env.enableMsw). (NFR-DATA-01)
- **NFR-U3-DATA-02**: regionCode 동적, 하드코딩 금지. (NFR-DATA-02)
- **NFR-U3-REL-01**: 코스 조회 로딩/에러/빈 상태는 AsyncBoundary 표준화(SECURITY-15).
- **NFR-U3-REL-02**: 정적 미리보기 이미지 로드 실패 → placeholder(비차단).
- **NFR-U3-SEC-08**: 기록 탭/마이페이지 항목 게이트(gateRules). 클라 차단 + 서버 이중방어.
- **NFR-U3-WV-01**: 미리보기 팝업=history 엔트리(좌측 스와이프 닫힘).
- **NFR-U3-PERF**: 코스 이미지 lazy 로딩, 번들 목표 유지(<300KB gzip 가이드 — 현재 ~98KB).

## 테스트
- example 중심. 도메인 property는 U0. 리포지토리/AsyncBoundary/탭바 게이트 example.

## Compliance
- SECURITY-08/15 Compliant, NFR-DATA-01/02 Compliant, PBT-10 example. 블로킹 없음.
