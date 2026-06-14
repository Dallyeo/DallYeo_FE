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
