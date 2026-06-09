/**
 * 도메인 상수 (business-rules.md / domain-entities.md)
 */

/** 기본 지역 코드 (FR-V02-08). regionLogic이 참조. */
export const DEFAULT_REGION_CODE = 'gunsan';
export const DEFAULT_REGION_NAME = '군산';

/** 키 자릿수: 2~3자리 (FD Q2=B) */
export const HEIGHT_DIGIT_MIN = 2;
export const HEIGHT_DIGIT_MAX = 3;

/** 체중 자릿수: 2~3자리 (FR-V01-06) */
export const WEIGHT_DIGIT_MIN = 2;
export const WEIGHT_DIGIT_MAX = 3;

/** 키 소프트 범위(cm) — 경고용, 비차단 (FD Q1=B) */
export const HEIGHT_RANGE_MIN_CM = 50;
export const HEIGHT_RANGE_MAX_CM = 250;

/** 체중 소프트 범위(kg) — 경고용, 비차단 (FD Q1=B) */
export const WEIGHT_RANGE_MIN_KG = 20;
export const WEIGHT_RANGE_MAX_KG = 300;
