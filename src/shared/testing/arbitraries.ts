/**
 * 공용 fast-check arbitraries (P-6, PBT). 도메인 로직 테스트에서 재사용.
 */
import fc from 'fast-check';
import type { AuthStatus, Gender, GateAction, Region } from '@/domain/types';

/** n자리 정수 문자열(선행 0 없음) */
export function integerStringOfDigits(minDigits: number, maxDigits: number): fc.Arbitrary<string> {
  return fc.integer({ min: 1, max: 9 }).chain((first) =>
    fc
      .array(fc.integer({ min: 0, max: 9 }), {
        minLength: minDigits - 1,
        maxLength: maxDigits - 1,
      })
      .map((rest) => String(first) + rest.join('')),
  );
}

/** 임의 자릿수(1~5) 정수 문자열 — 경계 테스트용 */
export const anyIntegerString = integerStringOfDigits(1, 5);

/** 유효 패턴(정수부 2~3자리 + 소수 1자리까지) 위반 문자열 — 항상 무효여야 함 */
export const invalidMeasureString: fc.Arbitrary<string> = fc.oneof(
  fc.constant(''),
  fc.constant(' '),
  fc.constant('-5'),
  fc.constant('12.55'), // 소수 2자리
  fc.constant('17.'), // 소수점 뒤 공란
  fc.constant('0'),
  fc.constant('01'),
  fc.constant('0.5'), // 선행 0
  fc.string().filter((s) => !/^[1-9][0-9]{1,2}(\.[0-9])?$/.test(s)),
);

export const authStatusArb: fc.Arbitrary<AuthStatus> = fc.constantFrom(
  'unknown',
  'authenticated',
  'unauthenticated',
);

export const genderArb: fc.Arbitrary<Gender> = fc.constantFrom('male', 'female', 'unspecified');

export const gateActionArb: fc.Arbitrary<GateAction> = fc.constantFrom(
  'recordsTab',
  'achievementsTab',
  'myPageTab',
  'myPageProfile',
  'myPageEditInfo',
  'myPageAccount',
  'saveRunResult',
);

export const regionArb: fc.Arbitrary<Region> = fc.record({
  code: fc.string({ minLength: 1, maxLength: 12 }),
  name: fc.string({ minLength: 1, maxLength: 12 }),
});

export const regionArrayArb: fc.Arbitrary<Region[]> = fc.array(regionArb, { maxLength: 8 });
