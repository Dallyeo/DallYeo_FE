# 백엔드 API 명세 (MVP1: Login · V01 · V02)

> 웹(WebView SPA)이 호출하는 백엔드 API 제안서. 프론트 도메인 타입 기준으로 작성했습니다.
> 협의 후 확정해 주세요. (백엔드 준비 전까지 웹은 MSW mock으로 동작합니다.)

---

## 공통 규약

- **Base URL**: 환경변수 `VITE_API_BASE_URL` (기본 `/api`)
- **인증 헤더**: 로그인 후 모든 요청에 `Authorization: Bearer <token>` 자동 첨부
  - 토큰은 **네이티브가 OAuth 후 백엔드와 교환**해 발급받아 웹에 주입 (웹은 토큰을 저장하지 않고 메모리에서 헤더로만 사용)
- **Content-Type**: `application/json`
- **인증 실패**: 토큰 만료/무효 시 **`401`** 응답 → 웹은 자동 로그아웃 처리(세션 초기화 + 메인 이동)
- **에러 응답(공통 형식 제안)**:
  ```json
  { "code": "COURSE_NOT_FOUND", "message": "코스를 찾을 수 없습니다." }
  ```

---

## 1. 인증 / 세션 (Auth)

> OAuth 핸드셰이크 및 토큰 발급은 **네이티브 ↔ 백엔드** 사이에서 이뤄집니다(웹은 관여하지 않음).
> 백엔드는 아래만 보장하면 됩니다.

| 항목 | 내용 |
|---|---|
| 토큰 검증 | 웹의 모든 요청 `Authorization: Bearer` 검증 |
| 만료/무효 | `401 Unauthorized` 반환 (웹이 로그아웃 트리거) |

> 참고: 네이티브용 토큰 발급/교환 엔드포인트(예: `POST /auth/oauth/{provider}`)는 네이티브 팀과 별도 협의 대상입니다. 본 문서(웹 관점)에서는 생략.

---

## 2. 지역 (Region)

### `GET /regions`
지원 지역 목록 조회 (지역 선택기).

- **요청**: 없음
- **응답 `200`**:
  ```json
  [
    { "code": "gunsan", "name": "군산" }
  ]
  ```
- **비고**: MVP1은 군산만. `code`는 문자열(하드코딩 금지, 다중 지역 확장 대비).

---

## 3. 코스 (Course)

### `GET /courses?regionCode={code}`
지역별 추천 코스 목록 (메인뷰).

- **쿼리**: `regionCode` (예: `gunsan`)
- **응답 `200`**:
  ```json
  [
    {
      "id": "c1",
      "title": "군산 원도심 근대문화 코스",
      "description": "근대 건축물을 따라 달리는 평지 코스.",
      "distanceKm": 4.2,
      "estimatedTime": "약 30분",
      "previewImageUrl": "https://.../c1-preview.png",
      "regionCode": "gunsan"
    }
  ]
  ```
- **비고**: 결과 없으면 빈 배열 `[]` (웹은 Empty 상태 표시).

### `GET /courses/{id}`
코스 단건 조회 (상세/미리보기 보강용).

- **응답 `200`**: 위 `Course` 객체 1건
- **에러 `404`**: 코스 없음

#### Course 필드 정의
| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | 코스 고유 ID |
| `title` | string | 코스 이름 |
| `description` | string | 설명 |
| `distanceKm` | number | 거리(km) |
| `estimatedTime` | string | 예상 시간(표시용 문자열) — *초 단위 number가 편하면 협의 가능* |
| `previewImageUrl` | string | **정적** 경로 미리보기 이미지 URL (지도 SDK 아님) |
| `regionCode` | string | 소속 지역 코드 |

---

## 4. (후속) 온보딩 / 프로필 — MVP1 범위 밖

> 현재 신체 정보(키/체중/성별)는 웹이 **로컬에만** 저장합니다. 로그인 사용자 프로필 동기화는 다음 라운드에서 아래 형태로 협의 예정.

| 예정 엔드포인트 | 용도 |
|---|---|
| `GET /me/profile` | 신체 정보 조회 |
| `PUT /me/profile` | 신체 정보 저장 (`{ heightCm, weightKg, gender }`) |

- `gender`: `"male" \| "female" \| "other" \| "unspecified"`
- `heightCm`/`weightKg`: 정수

---

## 협의 필요 사항
- [ ] 에러 응답 공통 형식 확정
- [ ] `estimatedTime` 타입 (문자열 vs 초 단위 숫자)
- [ ] `previewImageUrl` 호스팅 주체(백엔드 제공 vs TourAPI 프록시)
- [ ] 준비된 엔드포인트 vs 미준비(웹은 미준비분을 MSW mock으로 대체)
