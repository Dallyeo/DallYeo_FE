import { bridgeService } from '@/shared/services/BridgeService';
import IcRoute from '@/shared/ui/icons/ic-route.svg?react';

/**
 * 코스 만들기 → 네이티브 검색뷰 (V02-S3, FR-V02-05).
 * 우하단 플로팅 그린 필 버튼(탭바 위). 안전영역 인셋만큼 띄움.
 */
export function CreateCourseButton() {
  return (
    <button
      type="button"
      data-testid="create-course-button"
      onClick={() => bridgeService.openCourseSearch()}
      className="fixed right-4 z-20 flex items-center gap-2 rounded-full bg-green-700 py-4 pl-5 pr-6 text-label text-white shadow-lg"
      style={{ bottom: 'calc(var(--tabbar-height) + env(safe-area-inset-bottom) + 16px)' }}
    >
      <IcRoute aria-hidden className="h-5 w-5" />
      코스 만들기
    </button>
  );
}
