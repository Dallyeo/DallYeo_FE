import { useState } from 'react';
import type { Course } from '@/domain/types';
import { BottomSheet } from '@/shared/ui/BottomSheet';

/** i-버튼 미리보기 팝업 (V02-S5, FR-V02-07). 정적 이미지 — 지도 SDK 금지. */
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

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} testId="course-preview-popup">
      <div className="flex flex-col gap-3">
        <h2 className="text-lg">{course.title}</h2>
        {imageFailed ? (
          <div
            data-testid="course-preview-image-placeholder"
            className="flex h-40 items-center justify-center rounded-md bg-bg text-muted"
          >
            미리보기를 불러올 수 없어요
          </div>
        ) : (
          <img
            data-testid="course-preview-image"
            src={course.previewImageUrl}
            alt={`${course.title} 경로 미리보기`}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-40 w-full rounded-md object-cover"
          />
        )}
        <p className="text-sm text-muted">{course.description}</p>
        <p className="text-sm">
          {course.distanceKm}km · {course.estimatedTime}
        </p>
      </div>
    </BottomSheet>
  );
}
