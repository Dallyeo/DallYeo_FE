import { bridgeService } from '@/shared/services/BridgeService';
import IcAddLocation from '@/shared/ui/icons/ic-add-location.svg?react';

/**
 * 코스 생성 → 네이티브 검색뷰 (V02-S3, FR-V02-05).
 * 우하단 플로팅 그린 필 버튼(탭바 위). 안전영역 인셋만큼 띄움.
 * Figma: 158×55, radius 32, 우여백 16, 탭바와 간격 16, 아이콘→라벨 간격 4.
 */
export function CreateCourseButton() {
  return (
    <button
      type="button"
      data-testid="create-course-button"
      onClick={() => bridgeService.openCourseSearch()}
      className="fixed right-4 z-20 flex h-[55px] items-center gap-1 rounded-[32px] bg-green-700 px-[37px] text-label text-off-white shadow-[0_0_8px_rgba(0,0,0,0.1)]"
      style={{ bottom: 'calc(var(--tabbar-height) + env(safe-area-inset-bottom) + 16px)' }}
    >
      <IcAddLocation aria-hidden className="h-[19px] w-auto" />
      코스 생성
    </button>
  );
}
