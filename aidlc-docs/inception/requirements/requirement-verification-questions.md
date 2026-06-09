# Requirements Verification Questions — Login · V01 · V02

본 파일은 Requirements Analysis 단계에서 사용자에게 묻는 명확화 질문 모음입니다.

**답변 방법**: 각 질문 아래 `[Answer]:` 태그 뒤에 해당하는 알파벳(예: `A`)을 채워주세요. 보기에 맞는 것이 없으면 마지막의 "Other"를 선택하고 `[Answer]: X — (설명)` 형태로 자유 기술해주세요. 모든 질문을 채운 뒤 "완료" 또는 "done"이라고 알려주시면 분석을 진행합니다.

**참고 문서**:
- `CLAUDE.md` (프로젝트 컨텍스트 + 표준 결정)
- `docs/기능명세서.md` (V01·V02 화면 명세)

---

## Question 1
**MVP1 출시에 포함할 로그인 제공자는?** (CLAUDE.md 브릿지 정의는 kakao / apple / google 셋 다 지원)

A) Kakao만
B) Kakao + Apple
C) Kakao + Apple + Google (셋 다)
D) Apple만
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 2
**로그인 화면의 형태는?** (CLAUDE.md: "login screen renders buttons only and calls bridge.login()")

A) 별도 라우트 `/login` — 페이지 전환으로 진입
B) 풀스크린 모달 — 기존 화면 위에 오버레이
C) 하단 바텀시트 — 일부만 가리는 시트
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 3
**로그인 화면 진입 트리거는 어떻게 동작해야 하나?** (복수 정책이 가능하지만 MVP1 기준으로 한 가지 선택)

A) 비로그인 사용자가 게이트된 액션(기록 탭, 마이페이지 프로필 등)을 시도할 때만 자동으로 표시
B) 위 + V02(메인뷰)에 명시적 "로그인" 진입 버튼 추가
C) 앱 첫 진입 시 강제 (스킵 불가)
D) 앱 첫 진입 시 권유 (스킵 가능, 이후는 A처럼 동작)
X) Other (please describe after [Answer]: tag below)

[Answer]: A + 마이페이지에 로그인 안되어있으면 로그인하세요 배너 상단

---

## Question 4
**V01 온보딩 재실행 정책 (두 번째 실행부터)** — 스펙 V13 설정뷰에서 "키/체중/성별 수정"이 가능하므로 그 외 동작을 명확히 합니다.

A) 한 번 완료(또는 건너뛰기)하면 다시는 안 뜸. 신체 정보 수정은 설정에서만.
B) 한 번 완료하면 안 뜸. 단, 기본정보를 **건너뛴** 사용자는 다음 실행 시 한 번 더 권유.
C) 한 번 완료하면 안 뜸. 단, 위치 권한이 여전히 거부 상태면 위치 권한 안내 단계만 다시 표시.
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 5
**V01 성별 입력 옵션의 구성은?**

A) 남 / 여 (두 가지만)
B) 남 / 여 / 선택안함
C) 남 / 여 / 기타 / 선택안함
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 6
**V02 지역 선택 범위 (MVP1 출시 기준)** — 기능명세서 L52: "지역 기본값: 군산".

A) 군산만 (선택 UI는 표시하지만 다른 옵션 없음 / 미래 확장 자리)
B) 전라북도 시군 전체 (군산·전주·익산·정읍 등 모든 시군)
C) 군산 + 별도 지정 일부 시군 (지정 필요)
D) 전국 시군 리스트
X) Other (please describe after [Answer]: tag below)

[Answer]: 우선 군산만 MVP로, 추후 변동가능성 있음

---

## Question 7
**MVP1 출시 시점의 백엔드 준비도** — V02 추천 코스 / 지역 데이터 / 세션 API 등을 실 연동할 수 있는지 판단합니다.

A) 백엔드 미준비 → 전 구간 MSW mock으로만 진행. 실 백엔드 연동은 출시 후.
B) 일부 엔드포인트만 준비됨 → 준비된 것은 실 연동, 나머지는 mock. (구체적 엔드포인트 목록은 Workflow Planning 단계에서 별도 정의)
C) 백엔드 거의 준비 완료 → 처음부터 실 연동 위주, mock은 개발 편의용으로만.
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 8
**세션 만료 / 강제 로그아웃 처리** — 401 응답 또는 네이티브의 `sessionChanged` 이벤트로 토큰이 무효화되면?

A) 자동 로그아웃 + V02(메인)로 리다이렉트 + 토스트로 안내
B) 자동 로그아웃 + 즉시 로그인 화면으로 유도
C) 자동 로그아웃 + 현재 화면 유지(비로그인 상태) — 게이트된 영역만 차단
X) Other (please describe after [Answer]: tag below)

[Answer]: 로그인 토큰이 그렇게 짧지는 않을건데... 일단은 A로

---

## Question 9 — Extension Opt-In: Security Baseline
프로젝트 전반에 보안 베이스라인 규칙(Security Baseline)을 **blocking constraint**로 강제할까요?

A) Yes — 모든 SECURITY 규칙을 blocking으로 강제 (프로덕션급 서비스 권장)
B) No — SECURITY 규칙 미적용 (PoC / 프로토타입 / 실험 프로젝트용)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 10 — Extension Opt-In: Property-Based Testing
Property-Based Testing(PBT) 규칙을 **blocking constraint**로 강제할까요?

A) Yes — 모든 PBT 규칙을 blocking으로 강제 (비즈니스 로직/데이터 변환/직렬화/상태 컴포넌트 다수인 프로젝트 권장)
B) Partial — 순수 함수와 직렬화 라운드트립에만 PBT 적용
C) No — PBT 규칙 미적용 (단순 CRUD / UI-only / 얇은 통합 레이어용)
X) Other (please describe after [Answer]: tag below)

[Answer]: Y

---

**모두 채우셨으면 "완료"라고 알려주세요.** 답변에 모순이나 모호함이 발견되면 추가 명확화 질문 파일을 생성합니다 (`question-format-guide.md` 규약).
