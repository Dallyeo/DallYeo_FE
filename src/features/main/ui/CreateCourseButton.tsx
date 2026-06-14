import { bridgeService } from '@/shared/services/BridgeService';

/** 코스 만들기 → 네이티브 검색뷰 (V02-S3, FR-V02-05). 그린 버튼(흰 텍스트, 전체폭). */
export function CreateCourseButton() {
  return (
    <button
      type="button"
      data-testid="create-course-button"
      onClick={() => bridgeService.openCourseSearch()}
      className="w-full rounded-md bg-primary py-3.5 text-sb-15 text-primary-contrast"
    >
      코스 만들기
    </button>
  );
}
