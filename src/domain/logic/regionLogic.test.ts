import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { resolveDefaultRegion } from './regionLogic';
import { DEFAULT_REGION_CODE } from '@/domain/constants';
import { regionArrayArb } from '@/shared/testing/arbitraries';
import type { Region } from '@/domain/types';

const gunsan: Region = { code: DEFAULT_REGION_CODE, name: '군산' };

describe('regionLogic — resolveDefaultRegion', () => {
  it('example: 군산 포함 시 군산 반환', () => {
    expect(resolveDefaultRegion([{ code: 'seoul', name: '서울' }, gunsan]).code).toBe(
      DEFAULT_REGION_CODE,
    );
  });

  it('example: 군산 없으면 첫 항목', () => {
    expect(resolveDefaultRegion([{ code: 'seoul', name: '서울' }]).code).toBe('seoul');
  });

  it('example: 빈 목록이면 placeholder(군산)', () => {
    expect(resolveDefaultRegion([]).code).toBe(DEFAULT_REGION_CODE);
  });

  it('property: 군산이 목록에 있으면 항상 군산 반환', () => {
    fc.assert(
      fc.property(regionArrayArb, (regions) => {
        const withGunsan = [...regions, gunsan];
        return resolveDefaultRegion(withGunsan).code === DEFAULT_REGION_CODE;
      }),
    );
  });

  it('property: 임의 목록(빈 목록 포함)에서 항상 유효 Region 반환(non-null)', () => {
    fc.assert(
      fc.property(regionArrayArb, (regions) => {
        const r = resolveDefaultRegion(regions);
        return typeof r.code === 'string' && r.code.length > 0 && typeof r.name === 'string';
      }),
    );
  });
});
