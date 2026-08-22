import { useState } from 'react';
import type { Course } from '@/domain/types';
import { bridgeService } from '@/shared/services/BridgeService';
import { CoursePreviewPopup } from './CoursePreviewPopup';
import IcInfo from '@/shared/ui/icons/ic-info.svg?react';

/**
 * 추천 코스 행 (V02-S1/S3/S5). 카드 패널 내 divide-y 리스트 항목.
 * 본문 탭 → openCourseConfirm. i-버튼 → 미리보기 팝업.
 */
export function CourseCard({ course }: { course: Course }) {
  const [popupOpen, setPopupOpen] = useState(false);

  // Figma: 행 높이 100, 좌패딩 24 / 우패딩 16, 상하 15. 제목→설명 간격 5.
  return (
    <div className="flex items-center justify-between gap-3 py-[15px] pl-[24px] pr-4">
      <button
        type="button"
        data-testid={`course-card-${course.id}`}
        onClick={() => bridgeService.openCourseConfirm(course)}
        className="flex-1 text-left"
      >
        <h3 className="text-subheading text-gray-900">{course.title}</h3>
        {/* 시안은 소요시간·거리가 한 텍스트 블록(2줄) */}
        <p className="mt-[5px] text-caption text-gray-500">
          {course.estimatedTime}
          <br />
          {course.distanceKm}km
        </p>
      </button>
      <button
        type="button"
        data-testid={`course-card-info-${course.id}`}
        aria-label="코스 정보"
        onClick={() => setPopupOpen(true)}
        className="shrink-0 text-gray-300"
      >
        <IcInfo aria-hidden className="h-5 w-auto" />
      </button>
      <CoursePreviewPopup course={course} isOpen={popupOpen} onClose={() => setPopupOpen(false)} />
    </div>
  );
}
