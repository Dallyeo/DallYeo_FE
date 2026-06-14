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
    <div className="rounded-md bg-surface-subtle px-4 py-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          data-testid={`course-card-${course.id}`}
          onClick={() => bridgeService.openCourseConfirm(course)}
          className="flex-1 text-left"
        >
          <h3 className="text-sb-15 text-text-strong">{course.title}</h3>
          <p className="mt-1 text-m-12 text-muted">{course.estimatedTime}</p>
          <p className="text-m-12 text-muted">{course.distanceKm}km</p>
        </button>
        <button
          type="button"
          data-testid={`course-card-info-${course.id}`}
          aria-label="코스 정보"
          onClick={() => setPopupOpen(true)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-m-12 text-primary-contrast"
        >
          i
        </button>
      </div>
      <CoursePreviewPopup course={course} isOpen={popupOpen} onClose={() => setPopupOpen(false)} />
    </div>
  );
}
