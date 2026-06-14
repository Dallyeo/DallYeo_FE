/**
 * 신체 정보 검증 로직 (BR-1, FR-V01-05/06/09, SECURITY-05)
 * - 하드 규칙(차단): 양수, 정수부 자릿수, 소수 1자리까지(선택)
 * - 소프트 규칙(경고, 비차단): 의미적 범위
 */
import type { OnboardingProfile } from '@/domain/types';
import {
  HEIGHT_DIGIT_MIN,
  HEIGHT_DIGIT_MAX,
  WEIGHT_DIGIT_MIN,
  WEIGHT_DIGIT_MAX,
  MEASURE_DECIMAL_MAX,
  HEIGHT_RANGE_MIN_CM,
  HEIGHT_RANGE_MAX_CM,
  WEIGHT_RANGE_MIN_KG,
  WEIGHT_RANGE_MAX_KG,
} from '@/domain/constants';

/**
 * 양수 문자열 검증: 정수부 minDigits~maxDigits자리(선행 0 불허) + 소수점 이하 최대 maxDecimals자리(선택).
 * 예) (2,3,1): '50' '175' '167.5' '55.0' → true / '9' '1750' '17.55' '17.' '0.5' '' → false
 */
function isPositiveDecimalString(
  raw: string,
  minIntDigits: number,
  maxIntDigits: number,
  maxDecimals: number,
): boolean {
  const re = new RegExp(
    `^[1-9][0-9]{${minIntDigits - 1},${maxIntDigits - 1}}(\\.[0-9]{1,${maxDecimals}})?$`,
  );
  return re.test(raw);
}

/** 키 하드 검증: 정수부 2~3자리 + 소수 1자리까지 (FD Q2=B) */
export function isValidHeight(raw: string): boolean {
  return isPositiveDecimalString(raw, HEIGHT_DIGIT_MIN, HEIGHT_DIGIT_MAX, MEASURE_DECIMAL_MAX);
}

/** 체중 하드 검증: 정수부 2~3자리 + 소수 1자리까지 */
export function isValidWeight(raw: string): boolean {
  return isPositiveDecimalString(raw, WEIGHT_DIGIT_MIN, WEIGHT_DIGIT_MAX, MEASURE_DECIMAL_MAX);
}

/** 키 소프트 범위(경고용, 비차단) */
export function isHeightInRange(cm: number): boolean {
  return cm >= HEIGHT_RANGE_MIN_CM && cm <= HEIGHT_RANGE_MAX_CM;
}

/** 체중 소프트 범위(경고용, 비차단) */
export function isWeightInRange(kg: number): boolean {
  return kg >= WEIGHT_RANGE_MIN_KG && kg <= WEIGHT_RANGE_MAX_KG;
}

/**
 * 입력 완료 판정 (FR-V01-09): "입력 완료" 버튼 활성 조건.
 * 키·체중이 하드 통과 + 성별이 선택됨('unspecified'도 채워진 값, FD Q3).
 * 소프트 범위 경고는 결과에 영향 없음 (FD Q1=B).
 */
export function isProfileComplete(profile: OnboardingProfile): boolean {
  const heightOk = profile.heightCm !== undefined && isValidHeight(String(profile.heightCm));
  const weightOk = profile.weightKg !== undefined && isValidWeight(String(profile.weightKg));
  const genderOk = profile.gender !== undefined;
  return heightOk && weightOk && genderOk;
}
