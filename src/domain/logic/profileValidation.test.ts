import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  isValidHeight,
  isValidWeight,
  isProfileComplete,
} from './profileValidation';
import {
  integerStringOfDigits,
  nonIntegerString,
  genderArb,
} from '@/shared/testing/arbitraries';

describe('profileValidation — isValidHeight (키 2~3자리 정수)', () => {
  // example-based (PBT-10 병행)
  it('경계값', () => {
    expect(isValidHeight('9')).toBe(false); // 1자리
    expect(isValidHeight('50')).toBe(true); // 2자리
    expect(isValidHeight('175')).toBe(true); // 3자리
    expect(isValidHeight('1750')).toBe(false); // 4자리
    expect(isValidHeight('17.5')).toBe(false); // 비정수
    expect(isValidHeight('')).toBe(false);
    expect(isValidHeight('01')).toBe(false); // 선행 0
  });

  // property: 2~3자리 정수 문자열 ⇔ true
  it('property: 2~3자리 정수 문자열은 항상 유효', () => {
    fc.assert(
      fc.property(integerStringOfDigits(2, 3), (s) => isValidHeight(s) === true),
    );
  });

  it('property: 비정수 문자열은 항상 무효', () => {
    fc.assert(fc.property(nonIntegerString, (s) => isValidHeight(s) === false));
  });

  it('property: 4자리 이상 정수는 항상 무효', () => {
    fc.assert(
      fc.property(integerStringOfDigits(4, 6), (s) => isValidHeight(s) === false),
    );
  });
});

describe('profileValidation — isValidWeight (체중 2~3자리 정수)', () => {
  it('경계값', () => {
    expect(isValidWeight('9')).toBe(false);
    expect(isValidWeight('60')).toBe(true);
    expect(isValidWeight('100')).toBe(true);
    expect(isValidWeight('1000')).toBe(false);
  });

  it('property: 2~3자리 정수 ⇔ true', () => {
    fc.assert(
      fc.property(integerStringOfDigits(2, 3), (s) => isValidWeight(s) === true),
    );
  });
});

describe('profileValidation — isProfileComplete (입력 완료 판정)', () => {
  it("'선택안함'(unspecified)도 채워진 값으로 간주", () => {
    expect(
      isProfileComplete({ heightCm: 175, weightKg: 60, gender: 'unspecified' }),
    ).toBe(true);
  });

  it('하나라도 비면 false', () => {
    expect(isProfileComplete({ weightKg: 60, gender: 'male' })).toBe(false);
    expect(isProfileComplete({ heightCm: 175, gender: 'male' })).toBe(false);
    expect(isProfileComplete({ heightCm: 175, weightKg: 60 })).toBe(false);
    expect(isProfileComplete({})).toBe(false);
  });

  it('하드 검증 실패값이면 false (예: 키 1자리)', () => {
    expect(isProfileComplete({ heightCm: 9, weightKg: 60, gender: 'male' })).toBe(false);
  });

  // property: 유효 키·체중 + 임의 성별이면 항상 complete
  it('property: 유효 키·체중 + 성별 선택 ⇔ complete', () => {
    fc.assert(
      fc.property(
        integerStringOfDigits(2, 3),
        integerStringOfDigits(2, 3),
        genderArb,
        (h, w, gender) =>
          isProfileComplete({
            heightCm: Number(h),
            weightKg: Number(w),
            gender,
          }) === true,
      ),
    );
  });

  // property: 범위 밖이어도(소프트 경고) 하드 통과면 complete (FD Q1=B 독립성)
  it('property: 소프트 범위 위반은 complete 결과에 영향 없음', () => {
    // 999cm/999kg는 3자리 정수라 하드 통과지만 범위 밖
    expect(isProfileComplete({ heightCm: 999, weightKg: 999, gender: 'male' })).toBe(true);
  });
});
