import { bridgeService } from '@/shared/services/BridgeService';
import { Button } from '@/shared/ui';

/** 코스 만들기 → 네이티브 검색뷰 (V02-S3, FR-V02-05) */
export function CreateCourseButton() {
  return (
    <Button
      data-testid="create-course-button"
      onClick={() => bridgeService.openCourseSearch()}
      className="w-full"
    >
      코스 만들기
    </Button>
  );
}
