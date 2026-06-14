import { useSelectedRegion } from '@/features/main/model/useRegions';

/**
 * 지역 선택기 (V02-S4, FR-V02-08). MVP1은 군산만 — 선택 UI 노출, 선택지 1개.
 */
export function RegionSelector() {
  const { region, setRegion, regions } = useSelectedRegion();
  const options = regions.length > 0 ? regions : [region];

  return (
    <label className="flex items-center gap-2">
      <span className="text-m-12 text-muted">선택된 지역</span>
      <select
        data-testid="region-selector"
        value={region.code}
        onChange={(e) => {
          const next = options.find((r) => r.code === e.target.value);
          if (next) setRegion(next);
        }}
        className="rounded-full bg-primary-weak px-3 py-1 text-m-12 text-primary-contrast"
      >
        {options.map((r) => (
          <option key={r.code} value={r.code}>
            {r.name}
          </option>
        ))}
      </select>
    </label>
  );
}
