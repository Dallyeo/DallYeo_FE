import { useState } from 'react';
import { DISTANCE_CATEGORY_LABEL, type Course } from '@/domain/types';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { useCourseDetail } from '@/features/main/model/useCourseDetail';
import IcClose from '@/shared/ui/icons/ic-close.svg?react';

/**
 * i-버튼 코스정보 팝업 (V02-S5, FR-V02-07). 정적 이미지 — 지도 SDK 금지.
 * Figma(코스 정보 팝업_1, 822:3453): 중앙 모달 350×520 r8, 좌우 gutter 26, 내부 좌우 25 / 상하 20.
 * 내부 세로 간격 **17 고정**, 순서: 헤더 / 거리·난이도 / 정적지도 158 / 경유지 / 구분선 / 설명.
 * 거리·난이도는 라벨 열 폭 65 고정(좌측 정렬, 값이 뒤따름) — 양끝 정렬 아님.
 */
export function CoursePreviewPopup({
  course,
  isOpen,
  onClose,
}: {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  // 목록 응답은 요약(경유지·경로 없음) → 팝업이 열릴 때 상세를 조회한다.
  // 도착 전에는 목록 데이터로 먼저 그리고, 도착하면 상세로 덮어쓴다(레이아웃 점프 없음).
  const detailQuery = useCourseDetail(course.id, isOpen);
  const data: Course = detailQuery.data ?? course;

  const rows: Array<[string, string]> = [['거리', `약 ${data.distanceKm}KM`]];
  if (data.distanceCategory) {
    rows.push(['난이도', DISTANCE_CATEGORY_LABEL[data.distanceCategory]]);
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} testId="course-preview-popup" variant="center">
      <div className="flex flex-col gap-[17px]">
        {/* 헤더 — 제목 heading + 닫기 */}
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-heading text-gray-900">{data.title}</h2>
          <button
            type="button"
            data-testid="course-preview-close"
            aria-label="닫기"
            onClick={onClose}
            className="flex h-6 w-6 shrink-0 items-center justify-center text-gray-500"
          >
            {/* 시안: 탭 영역 24×24 / 글리프 13×13 */}
            <IcClose aria-hidden className="h-[13px] w-auto" />
          </button>
        </div>

        {/* 거리·난이도 — 라벨 열 65 고정, 행 간격 0 */}
        <dl className="flex flex-col">
          {rows.map(([label, value]) => (
            <div key={label} className="flex">
              <dt className="w-[65px] shrink-0 text-label-sm text-gray-700">{label}</dt>
              <dd className="text-label-sm text-gray-900">{value}</dd>
            </div>
          ))}
        </dl>

        {/* 정적 경로 미리보기 — 높이 158, r8 */}
        {imageFailed ? (
          <div
            data-testid="course-preview-image-placeholder"
            className="flex h-[158px] items-center justify-center rounded-md bg-gray-200 text-body-sm text-gray-500"
          >
            미리보기를 불러올 수 없어요
          </div>
        ) : (
          <img
            data-testid="course-preview-image"
            src={data.previewImageUrl}
            alt={`${data.title} 경로 미리보기`}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-[158px] w-full rounded-md object-cover"
          />
        )}

        {data.waypoints && data.waypoints.length > 0 && (
          <ul data-testid="course-preview-waypoints" className="flex flex-col">
            {data.waypoints.map((name) => (
              <li key={name} className="text-label-sm text-gray-700">
                {name}
              </li>
            ))}
          </ul>
        )}

        {data.description && (
          <>
            <hr className="border-0 border-t border-gray-250" />
            <p className="text-caption text-gray-700">{data.description}</p>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
