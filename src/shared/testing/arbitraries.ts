/**
 * 공용 fast-check arbitraries (P-6, PBT). 도메인 로직 테스트에서 재사용.
 */
import fc from 'fast-check';
import type { AuthStatus, Gender, GateAction, Region } from '@/domain/types';

/** n자리 정수 문자열(선행 0 없음) */
export function integerStringOfDigits(minDigits: number, maxDigits: number): fc.Arbitrary<string> {
  return fc
    .integer({ min: 1, max: 9 })
    .chain((first) =>
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

/** 비정수/오염 문자열(공백, 기호, 소수점, 음수, 빈 문자열) */
export const nonIntegerString: fc.Arbitrary<string> = fc.oneof(
  fc.constant(''),
  fc.constant(' '),
  fc.constant('-5'),
  fc.constant('12.5'),
  fc.constant('0'),
  fc.constant('01'),
  fc.string().filter((s) => !/^[1-9][0-9]*$/.test(s)),
);

export const authStatusArb: fc.Arbitrary<AuthStatus> = fc.constantFrom(
  'unknown',
  'authenticated',
  'unauthenticated',
);

export const genderArb: fc.Arbitrary<Gender> = fc.constantFrom(
  'male',
  'female',
  'other',
  'unspecified',
);

export const gateActionArb: fc.Arbitrary<GateAction> = fc.constantFrom(
  'recordsTab',
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
