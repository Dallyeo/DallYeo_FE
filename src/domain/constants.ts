/**
 * 도메인 상수 (business-rules.md / domain-entities.md)
 */

/** 기본 지역 코드 (FR-V02-08). regionLogic이 참조. */
export const DEFAULT_REGION_CODE = 'gunsan';
export const DEFAULT_REGION_NAME = '군산';

/** 키 정수부 자릿수: 2~3자리 (FD Q2=B) */
export const HEIGHT_DIGIT_MIN = 2;
export const HEIGHT_DIGIT_MAX = 3;

/** 체중 정수부 자릿수: 2~3자리 (FR-V01-06) */
export const WEIGHT_DIGIT_MIN = 2;
export const WEIGHT_DIGIT_MAX = 3;

/** 소수 허용 자릿수: 소수점 첫째 자리까지 (디자인 V01 — 167.5cm / 55.0kg).
 *  드롭다운 → 입력창 임시 변경 상태. 디자이너/PM 논의 후 확정 예정. */
export const MEASURE_DECIMAL_MAX = 1;

/** 키 소프트 범위(cm) — 경고용, 비차단 (FD Q1=B) */
export const HEIGHT_RANGE_MIN_CM = 50;
export const HEIGHT_RANGE_MAX_CM = 250;

/** 체중 소프트 범위(kg) — 경고용, 비차단 (FD Q1=B) */
export const WEIGHT_RANGE_MIN_KG = 20;
export const WEIGHT_RANGE_MAX_KG = 300;

/**
 * 완주율 메시지 (FR-V10, 스펙 정확 문자열).
 * 스크린샷 문구와 다를 수 있으나 docs/기능명세서.md가 소스 오브 트루스.
 * complete: 100% / half: 50% 이상 / low: 50% 미만
 */
export const COMPLETION_MESSAGE = {
  complete: '축하해요! 완주에 성공했어요. 이제 마음 놓고 여행과 음식을 즐겨볼까요?',
  half: '수고하셨어요! 다음에는 끝까지 달려보는 것 어떠세요?',
  low: '아쉬워도 무리하지마세요! 조금 쉬었다가 다시 달려볼까요?',
} as const;

/** 완주율 티어 경계(%) — half 하한 (BR: 50% 이상) */
export const COMPLETION_HALF_MIN = 50;
/** 완주율 티어 경계(%) — complete 하한 (BR: 100%) */
export const COMPLETION_COMPLETE_MIN = 100;

/** 완주 결과 이탈 시 비로그인 확인 팝업 copy (FR-V10, 스펙 정확 문자열) */
export const RUN_RESULT_LEAVE_LOGIN_CONFIRM =
  '지금 이 화면을 벗어나시면 기록이 저장되지 않습니다. 로그인 하시겠습니까?';

/** 주변 장소 검색 반경(m) (FR-V10) */
export const NEARBY_PLACE_RADIUS_M = 500;

/** 설정 외부 링크 (FR-V13 문의/약관). 실제 URL은 확정 시 교체(placeholder). */
export const SETTINGS_LINKS = {
  inquiry: 'https://dallyeo.app/support',
  terms: 'https://dallyeo.app/terms',
  privacy: 'https://dallyeo.app/privacy',
} as const;
