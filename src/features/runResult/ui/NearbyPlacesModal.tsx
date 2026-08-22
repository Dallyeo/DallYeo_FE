import { useState } from 'react';
import { PLACE_SEGMENTS, type NearbyPlace, type PlaceSegment } from '@/domain/types';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { AsyncBoundary } from '@/shared/ui/AsyncBoundary';

interface QueryLike<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * V10 「주변 둘러보기」 모달 (FR-V10, 완주 위치 반경 500m).
 * Figma(결과 모달 785:2847): 하단 시트 402×568 r8, 상단 핸들 50×5.
 * 탭 2종(음식점/편의시설) `text-label-sm` — 활성 green-700 / 비활성 gray-500.
 * 카드: 사진 370×140 r6 → 간격 16 → 정보 행(이름+업종 / 주소 / 영업시간·영업중, 우측 전화하기·길찾기).
 */
export function NearbyPlacesModal({
  query,
  isOpen,
  onClose,
  onSelect,
}: {
  query: QueryLike<NearbyPlace[]>;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (place: NearbyPlace) => void;
}) {
  const [segment, setSegment] = useState<PlaceSegment>('restaurant');

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} testId="nearby-places-modal" draggable>
      <div data-testid="nearby-place-list" className="flex min-h-0 flex-1 flex-col gap-4">
        {/* 세그먼트 탭 — 시안: 탭 박스 60 고정, 간격 10, 좌측 15 들여쓰기.
            활성 표시(초록 밑줄)는 시안엔 없으나 요청으로 추가 — 슬라이딩 전환. */}
        <div className="shrink-0 pl-[15px]">
          <div className="relative inline-flex gap-2.5" role="tablist">
            {PLACE_SEGMENTS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={segment === key}
                data-testid={`segment-${key}`}
                onClick={() => setSegment(key)}
                className={`h-[38px] w-[60px] text-label-sm transition-colors ${
                  segment === key ? 'text-green-700' : 'text-gray-500'
                }`}
              >
                {label}
              </button>
            ))}
            {/* 밑줄 — 탭 폭 60 + 간격 10 이므로 인덱스당 70px 이동 */}
            <span
              aria-hidden
              data-testid="segment-underline"
              className="absolute bottom-0 left-0 h-[2px] w-[60px] rounded-sm bg-green-700 transition-transform duration-200 ease-out"
              style={{
                transform: `translateX(${PLACE_SEGMENTS.findIndex((s) => s.key === segment) * 70}px)`,
              }}
            />
          </div>
        </div>

        <AsyncBoundary
          query={query}
          isEmpty={(places) => places.filter((p) => p.segment === segment).length === 0}
          emptyMessage="주변에 표시할 장소가 없어요."
          loadingLabel="주변 장소를 불러오는 중..."
          testId="nearby"
        >
          {(places) => (
            <ul className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-4">
              {places
                .filter((p) => p.segment === segment)
                .map((place) => (
                  <li key={place.id} className="flex flex-col gap-4">
                    {place.photoUrl ? (
                      <img
                        src={place.photoUrl}
                        alt=""
                        loading="lazy"
                        className="h-[140px] w-full rounded-sm bg-gray-200 object-cover"
                      />
                    ) : (
                      <div
                        data-testid={`nearby-item-${place.id}-nophoto`}
                        className="flex h-[140px] w-full items-center justify-center rounded-sm bg-gray-200 text-caption text-gray-500"
                      >
                        사진 없음
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 flex-col gap-px">
                        <p className="flex items-baseline gap-2">
                          <span className="truncate text-subheading text-gray-900">
                            {place.name}
                          </span>
                          {place.category && (
                            <span className="shrink-0 text-caption-light text-gray-700">
                              {place.category}
                            </span>
                          )}
                        </p>
                        <p className="truncate text-caption text-gray-700">{place.address}</p>
                        {(place.businessHours || place.isOpenNow !== undefined) && (
                          <p className="flex items-center gap-[5px]">
                            {place.businessHours && (
                              <span className="text-caption-light text-gray-700">
                                {place.businessHours}
                              </span>
                            )}
                            {place.isOpenNow && (
                              <span className="text-overline text-green-700">영업중</span>
                            )}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 gap-4">
                        {place.phoneNumber && (
                          <a
                            href={`tel:${place.phoneNumber}`}
                            data-testid={`nearby-call-${place.id}`}
                            className="text-caption text-green-700"
                          >
                            전화하기
                          </a>
                        )}
                        <button
                          type="button"
                          data-testid={`nearby-item-${place.id}`}
                          onClick={() => onSelect(place)}
                          className="text-caption text-green-700"
                        >
                          길찾기
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </AsyncBoundary>
      </div>
    </BottomSheet>
  );
}
