import { useState } from 'react';
import type { NearbyPlace, PlaceSegment } from '@/domain/types';
import { formatDistanceM } from '@/shared/format/runFormat';

const SEGMENTS: { key: PlaceSegment; label: string }[] = [
  { key: 'amenity', label: '편의시설' },
  { key: 'restaurant', label: '음식점' },
];

/**
 * 완주 위치 500m 주변 장소 리스트 (FR-V10). 편의시설/음식점 세그먼트 전환.
 * 항목 탭 → 외부 지도(onSelect). lo-fi 스켈레톤.
 */
export function NearbyPlaceList({
  places,
  onSelect,
}: {
  places: NearbyPlace[];
  onSelect: (place: NearbyPlace) => void;
}) {
  const [segment, setSegment] = useState<PlaceSegment>('amenity');
  const filtered = places.filter((p) => p.segment === segment);

  return (
    <div data-testid="nearby-place-list" className="flex flex-col gap-3">
      {/* 세그먼트 */}
      <div className="flex rounded-full bg-surface p-1" role="tablist">
        {SEGMENTS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={segment === key}
            data-testid={`segment-${key}`}
            onClick={() => setSegment(key)}
            className={`flex-1 rounded-full py-2 text-m-12 ${
              segment === key ? 'bg-primary text-primary-contrast' : 'text-subtle'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 리스트 */}
      {filtered.length === 0 ? (
        <p data-testid="nearby-empty" className="p-4 text-center text-muted">
          주변에 표시할 장소가 없어요.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((place) => (
            <li key={place.id}>
              <button
                type="button"
                data-testid={`nearby-item-${place.id}`}
                onClick={() => onSelect(place)}
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface p-3 text-left"
              >
                <div className="h-12 w-12 shrink-0 rounded-md bg-bg" aria-hidden />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-m-15 text-text-strong">{place.name}</span>
                  <span className="truncate text-m-12 text-subtle">{place.address}</span>
                </div>
                <span className="shrink-0 text-sb-15 text-text">{formatDistanceM(place.distanceM)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
