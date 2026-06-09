import { useSelectedRegion } from '@/features/main/model/useRegions';

/**
 * 지역 선택기 (V02-S4, FR-V02-08). MVP1은 군산만 — 선택 UI 노출, 선택지 1개.
 */
export function RegionSelector() {
  const { region, setRegion, regions } = useSelectedRegion();
  const options = regions.length > 0 ? regions : [region];

  return (
    <label className="flex items-center gap-2">
      <span className="text-sm text-muted">지역</span>
      <select
        data-testid="region-selector"
        value={region.code}
        onChange={(e) => {
          const next = options.find((r) => r.code === e.target.value);
          if (next) setRegion(next);
        }}
        className="rounded-md border border-border bg-surface px-3 py-1.5"
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
