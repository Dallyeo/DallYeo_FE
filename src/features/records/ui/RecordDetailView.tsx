import { useParams, useNavigate } from 'react-router-dom';
import type { RunRecordDetail } from '@/domain/types';
import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { AsyncBoundary } from '@/shared/ui/AsyncBoundary';
import { Button } from '@/shared/ui';
import { bridgeService } from '@/shared/services/BridgeService';
import { toast } from '@/shared/ui/toastStore';
import { formatDistanceKm, formatDuration, formatPace } from '@/shared/format/runFormat';
import {
  formatDotDate,
  formatMonthDayWeekdayShort,
} from '@/shared/format/dateFormat';
import { useRecordDetail } from '@/features/records/model/useRecordDetail';

/**
 * V12 기록상세뷰 (lo-fi 스켈레톤). 정적 지도(줌 없음) + 통계 + 공유/링크복사.
 * 헤더 뒤로가기는 history pop(네이티브 back/에지 스와이프와 호환).
 */
export function RecordDetailView() {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const detailQuery = useRecordDetail(recordId);

  function share(detail: RunRecordDetail): void {
    bridgeService.share({
      title: '달여 러닝 기록',
      text: `${formatDistanceKm(detail.distanceKm)}km`,
      url: `https://dallyeo.app/records/${encodeURIComponent(detail.id)}`,
    });
  }

  async function copyLink(detail: RunRecordDetail): Promise<void> {
    try {
      await navigator.clipboard?.writeText(`https://dallyeo.app/records/${detail.id}`);
      toast.show('링크를 복사했어요.');
    } catch {
      toast.show('링크 복사를 지원하지 않는 환경이에요.');
    }
  }

  return (
    <SafeAreaLayout>
      <header className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          data-testid="record-detail-back"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="text-sb-20 text-text-strong"
        >
          ‹
        </button>
        <h1 className="flex-1 text-center text-m-15 text-text-strong">
          {detailQuery.data ? formatMonthDayWeekdayShort(detailQuery.data.completedAt) : '기록 상세'}
        </h1>
        <span className="w-5" aria-hidden />
      </header>

      <main data-testid="record-detail-view" className="flex flex-1 flex-col gap-4 overflow-y-auto p-5 pb-10">
        <AsyncBoundary
          query={detailQuery}
          loadingLabel="기록을 불러오는 중..."
          testId="record-detail"
        >
          {(detail) => (
            <>
              <section className="flex flex-col items-center gap-5 rounded-3xl bg-surface px-5 py-8">
                <p data-testid="record-distance" className="text-b-34 text-text-strong">
                  {formatDistanceKm(detail.distanceKm)}km
                </p>

                <dl className="flex w-full items-center justify-around">
                  <Stat label="완주 시간" value={formatDuration(detail.durationSec)} />
                  <Divider />
                  <Stat label="평균 페이스" value={formatPace(detail.avgPaceSecPerKm)} />
                  <Divider />
                  <Stat label="칼로리" value={String(detail.calories)} />
                </dl>

                <img
                  src={detail.staticMapImageUrl}
                  alt="러닝 경로 지도"
                  className="aspect-square w-full rounded-2xl bg-bg object-cover"
                />

                <span className="text-m-12 text-subtle">{formatDotDate(detail.completedAt)}</span>
              </section>

              <div className="flex gap-2.5">
                <Button
                  variant="secondary"
                  className="h-14 flex-1 rounded-2xl"
                  data-testid="record-copy-link"
                  onClick={() => copyLink(detail)}
                >
                  🔗 링크 복사
                </Button>
                <Button
                  className="h-14 flex-1 rounded-2xl"
                  data-testid="record-share"
                  onClick={() => share(detail)}
                >
                  ↥ 공유
                </Button>
              </div>
            </>
          )}
        </AsyncBoundary>
      </main>
    </SafeAreaLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <dd className="text-sb-20 text-text-strong">{value}</dd>
      <dt className="text-m-12 text-subtle">{label}</dt>
    </div>
  );
}

function Divider() {
  return <span aria-hidden className="h-8 w-px bg-border" />;
}
