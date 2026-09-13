import type { CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { AsyncBoundary } from '@/shared/ui/AsyncBoundary';
import { usePagedSwipe } from '@/shared/ui/usePagedSwipe';
import { useCaptureShare } from '@/shared/ui/useCaptureShare';
import { formatDistanceKm } from '@/shared/format/runFormat';
import { useAuth } from '@/features/login/model/useAuth';
import { useRecordDetail } from '@/features/records/model/useRecordDetail';
import { useRecordPages } from '@/features/records/model/useRecordPages';
import { RecordTicket } from '@/features/records/ui/RecordTicket';
import IcBack from '@/shared/ui/icons/ic-back.svg?react';

/** "7월 20일 (일)" */
function formatTitleDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${weekday})`;
}

/**
 * V12 기록 상세 (시안 `V12_기록_후_new` 999:3422).
 *
 * 이전/현재/다음 티켓을 한 트랙에 올려 **iOS 페이징 스크롤처럼** 넘긴다 — 손끝을 따라 밀리고,
 * 놓으면 거리·속도로 목적지를 정해 감속하며 붙는다(`usePagedSwipe`). 데이터만 갈아끼우면
 * "옆으로 넘긴다"는 느낌이 나지 않는다.
 */
export function RecordDetailView() {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const { status } = useAuth();
  const detailQuery = useRecordDetail(recordId);
  const { pages, index } = useRecordPages(recordId, status === 'authenticated');

  // 스와이프는 **히스토리를 쌓지 않는다**(replace) — 티켓 10장을 넘긴 뒤 뒤로가기가
  // 10번 필요해지면 좌측 엣지 뒤로가기가 사실상 못 쓰게 된다.
  const swipe = usePagedSwipe({
    index,
    count: pages.length,
    onChange: (next) => {
      const id = pages[next]?.id;
      if (id) navigate(`/records/${id}`, { replace: true });
    },
  });

  // 티켓만 투명 배경 PNG로 떠서 네이티브 앨범 저장 / 공유 시트로 넘긴다 (V10과 동일 경로).
  // 훅은 AsyncBoundary 바깥에서만 부를 수 있어 데이터는 query에서 직접 읽는다.
  const ticket = useCaptureShare({
    fileName: () => `dallyeo-ticket-${detailQuery.data?.id ?? 'record'}`,
    text: () =>
      detailQuery.data
        ? `${formatDistanceKm(detailQuery.data.distanceKm)}km 완주!`
        : '달여 러닝 기록',
  });

  /*
   * 공유/저장은 **티켓 이미지 기준**으로 `useCaptureShare`가 담당한다(V10과 동일).
   * 이전 구현은 텍스트만 공유하고 `/records/{id}` 링크를 복사했지만, 앱은 로컬 번들이라
   * 그 주소는 받는 사람에게 열리지 않는다.
   */

  return (
    // 상태바(safe-area)까지 primary로 채운다 — iOS에서 상단이 흰 띠로 남지 않게
    // 네비게이션바 화면은 상단 여백을 줄인다
    <SafeAreaLayout
      topInset={false}
      bgClass="bg-green-700"
      style={{ '--screen-top-gap': '6px' } as CSSProperties}
    >
      <AsyncBoundary
        query={detailQuery}
        loadingLabel="기록을 불러오는 중..."
        testId="record-detail"
      >
        {(detail) => (
          <main
            data-testid="record-detail-view"
            className="relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto bg-green-700"
          >
            {/* 앱바 — 뒤로 40×40(좌16) / 가운데 날짜. 기록 넘기기는 **스와이프 전용**.
                안전영역 패딩은 바깥에 (고정 높이와 같은 요소에 주면 내용이 상태바에 붙는다) */}
            <div className="shrink-0 pt-screen">
              <div className="relative flex h-10 items-center px-4">
                <button
                  type="button"
                  data-testid="record-detail-back"
                  aria-label="뒤로가기"
                  onClick={() => navigate(-1)}
                  className="mt-0.5 flex h-10 w-10 items-center justify-center text-off-white"
                >
                  <IcBack aria-hidden className="h-10 w-10" />
                </button>
                <h1 className="pointer-events-none absolute inset-x-0 mt-0.5 text-center text-subheading text-off-white">
                  {formatTitleDate(detail.completedAt)}
                </h1>
              </div>
            </div>

            {/* 티켓 트랙 — 이웃 기록을 미리 그려두고 통째로 민다.
                `pan-y`로 세로 스크롤은 브라우저에 남긴다(가로만 우리가 가져간다). */}
            <div
              data-testid="record-swipe"
              {...swipe.handlers}
              className="overflow-hidden"
              style={{ touchAction: 'pan-y' }}
            >
              <div
                ref={swipe.trackRef}
                data-testid="record-track"
                className="flex items-start"
                style={swipe.trackStyle}
              >
                {pages.map((page, i) => (
                  <RecordTicket
                    key={page.id}
                    // 현재 장은 항상 상세를 쓴다 — 옆 장은 아직 요약뿐일 수 있다
                    record={i === index ? detail : (page.record ?? detail)}
                    active={i === index}
                    captureRef={ticket.containerRef}
                    busy={ticket.busy !== null}
                    onShare={ticket.shareImage}
                    onSave={ticket.saveImage}
                  />
                ))}
              </div>
            </div>
          </main>
        )}
      </AsyncBoundary>
    </SafeAreaLayout>
  );
}
