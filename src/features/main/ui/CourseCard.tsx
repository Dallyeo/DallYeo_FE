import { useState } from 'react';
import type { Course } from '@/domain/types';
import { bridgeService } from '@/shared/services/BridgeService';
import { CoursePreviewPopup } from './CoursePreviewPopup';

/**
 * 추천 코스 행 (V02-S1/S3/S5). 카드 패널 내 divide-y 리스트 항목.
 * 본문 탭 → openCourseConfirm. i-버튼 → 미리보기 팝업.
 */
export function CourseCard({ course }: { course: Course }) {
  const [popupOpen, setPopupOpen] = useState(false);

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-5">
      <button
        type="button"
        data-testid={`course-card-${course.id}`}
        onClick={() => bridgeService.openCourseConfirm(course)}
        className="flex-1 text-left"
      >
        <h3 className="text-heading text-black">{course.title}</h3>
        <p className="mt-2 text-body-sm text-gray-500">{course.estimatedTime}</p>
        <p className="mt-0.5 text-body-sm text-gray-500">{course.distanceKm}km</p>
      </button>
      <button
        type="button"
        data-testid={`course-card-info-${course.id}`}
        aria-label="코스 정보"
        onClick={() => setPopupOpen(true)}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-disabled text-caption text-white"
      >
        i
      </button>
      <CoursePreviewPopup course={course} isOpen={popupOpen} onClose={() => setPopupOpen(false)} />
    </div>
  );
}
