import { create } from 'zustand';
import type { Region } from '@/domain/types';
import { DEFAULT_REGION_CODE, DEFAULT_REGION_NAME } from '@/domain/constants';

interface RegionState {
  region: Region;
  setRegion: (region: Region) => void;
}

/** 선택 지역. 기본 군산 (FR-V02-08). 목록 로드 후 resolveDefaultRegion으로 보정. */
export const useRegionStore = create<RegionState>((set) => ({
  region: { code: DEFAULT_REGION_CODE, name: DEFAULT_REGION_NAME },
  setRegion: (region) => set({ region }),
}));
