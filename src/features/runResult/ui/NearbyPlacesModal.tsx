import type { NearbyPlace } from '@/domain/types';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { AsyncBoundary } from '@/shared/ui/AsyncBoundary';

interface QueryLike<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * V10 「주변 둘러보기」 모달 (FR-V10, 완주 위치 반경 500m) — **음식점만**.
 * Figma(결과 모달 785:2847): 하단 시트 402×568 r8, 상단 핸들 50×5.
 * 카드: 사진 370×140 r6 → 간격 16 → 정보 행(이름+업종 / 주소 / 영업시간·영업중, 우측 전화하기·길찾기).
 *
 * ⚠️ 시안의 「편의시설」 탭은 **제거**됐다(2026-09-15 사용자 결정) — 반경 500m 안에서 거의 비어
 * 있었고, 관광지·숙박을 "편의시설"로 묶는 것도 어색했다. 탭이 하나뿐이라 전환 UI는 두지 않고
 * 시안의 **활성 탭 모양만** 제목으로 남긴다(목록이 무엇인지 알려주는 역할).
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
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} testId="nearby-places-modal" draggable>
      <div data-testid="nearby-place-list" className="flex min-h-0 flex-1 flex-col gap-4">
        {/* 제목 — 시안 활성 탭과 같은 자리·같은 모양(탭 박스 60, 좌측 15 들여쓰기, 초록 밑줄) */}
        <div className="shrink-0 pl-[15px]">
          <h2
            data-testid="nearby-heading"
            className="relative flex h-[38px] w-[60px] items-center justify-center text-label-sm text-green-700"
          >
            음식점
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[2px] rounded-sm bg-green-700"
            />
          </h2>
        </div>

        <AsyncBoundary
          query={query}
          emptyMessage="주변에 표시할 음식점이 없어요."
          loadingLabel="주변 음식점을 불러오는 중..."
          testId="nearby"
        >
          {(places) => (
            <ul className="flex min-h-0 flex-1 flex-col gap-5 overflow-x-hidden overflow-y-auto pb-4">
              {places.map((place) => (
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
                        <span className="truncate text-subheading text-gray-900">{place.name}</span>
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
