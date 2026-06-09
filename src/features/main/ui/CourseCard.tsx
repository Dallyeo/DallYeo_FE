import { useState } from 'react';
import type { Course } from '@/domain/types';
import { bridgeService } from '@/shared/services/BridgeService';
import { CoursePreviewPopup } from './CoursePreviewPopup';

/**
 * 추천 코스 카드 (V02-S1/S3/S5).
 * 본문 탭 → openCourseConfirm. i-버튼 → 미리보기 팝업.
 */
export function CourseCard({ course }: { course: Course }) {
  const [popupOpen, setPopupOpen] = useState(false);

  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          data-testid={`course-card-${course.id}`}
          onClick={() => bridgeService.openCourseConfirm(course)}
          className="flex-1 text-left"
        >
          <h3 className="text-base">{course.title}</h3>
          <p className="mt-1 text-sm text-muted">
            {course.distanceKm}km · {course.estimatedTime}
          </p>
        </button>
        <button
          type="button"
          data-testid={`course-card-info-${course.id}`}
          aria-label="코스 정보"
          onClick={() => setPopupOpen(true)}
          className="rounded-full border border-border px-2 py-1 text-sm"
        >
          i
        </button>
      </div>
      <CoursePreviewPopup course={course} isOpen={popupOpen} onClose={() => setPopupOpen(false)} />
    </div>
  );
}
