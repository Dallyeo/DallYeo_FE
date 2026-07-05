import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { AsyncBoundary } from '@/shared/ui/AsyncBoundary';
import { Button } from '@/shared/ui';
import { completionMessage, resolveCompletionTier } from '@/domain/logic';
import { formatDistanceKm, formatDuration, formatPace } from '@/shared/format/runFormat';
import { useRunResult } from '@/features/runResult/model/useRunResult';
import { useNearbyPlaces } from '@/features/runResult/model/useNearbyPlaces';
import { runResultStore } from '@/features/runResult/model/runResultStore';
import { buildDevRunResult } from '@/features/runResult/model/buildDevRunResult';
import { NearbyPlaceList } from './NearbyPlaceList';
import { LeaveConfirmDialog } from './LeaveConfirmDialog';

/** 개발 전용: 결과 없이 /run-result 직접 진입 시 mock seed (?rate=완주율%, 기본 100). */
function useDevRunResultSeed(hasResult: boolean): void {
  useEffect(() => {
    // vite dev 서버에서만(test/prod 제외) 자동 seed
    if (import.meta.env.MODE !== 'development' || hasResult || typeof window === 'undefined') return;
    const raw = Number(new URLSearchParams(window.location.search).get('rate'));
    const rate = Number.isFinite(raw) && raw > 0 ? Math.min(raw, 100) : 100;
    runResultStore.getState().setResult(buildDevRunResult(rate));
  }, [hasResult]);
}

/**
 * V10 완주결과뷰 (lo-fi 스켈레톤). 'runCompleted' 이벤트로 채워진 store 기반.
 * 완주 메시지·정적지도·통계·주변장소(500m). 저장 게이팅은 useRunResult가 담당.
 */
export function RunResultView() {
  const navigate = useNavigate();
  const {
    result,
    saving,
    confirmOpen,
    leaveToMain,
    confirmLogin,
    leaveWithoutSave,
    closeConfirm,
    share,
    copyLink,
    openPlace,
  } = useRunResult();
  const nearbyQuery = useNearbyPlaces(result?.runId);

  // dev: 결과 없이 직접 진입하면 mock seed (프로덕션에선 폴백 표시)
  useDevRunResultSeed(!!result);

  // 이벤트 없이 직접 진입 등 결과 없음 → 폴백 (프로덕션)
  if (!result) {
    return (
      <SafeAreaLayout>
        <main
          data-testid="run-result-empty"
          className="flex flex-1 flex-col items-center justify-center gap-4 p-6"
        >
          <p className="text-muted">표시할 완주 결과가 없어요.</p>
          <Button onClick={() => navigate('/main')}>메인으로</Button>
        </main>
      </SafeAreaLayout>
    );
  }

  const tier = resolveCompletionTier(result.completionRate);

  return (
    <SafeAreaLayout>
      <main data-testid="run-result-view" className="flex flex-1 flex-col gap-8 overflow-y-auto p-5 pb-10">
        {/* 결과 카드 */}
        <section className="flex flex-col items-center gap-5 rounded-3xl bg-surface px-5 py-8">
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-sb-20 text-text-strong">
              {tier === 'complete' ? '완주 성공!' : '완주 완료'}
            </h1>
            <p data-testid="run-distance" className="text-b-34 text-text-strong">
              {formatDistanceKm(result.distanceKm)}km
            </p>
            <p
              data-testid="completion-message"
              className="text-center text-m-15 leading-relaxed text-subtle"
            >
              {completionMessage(result.completionRate)}
            </p>
          </div>

          {/* 정적 지도(줌 없음) */}
          <img
            src={result.staticMapImageUrl}
            alt="완주 경로 지도"
            className="aspect-square w-full rounded-2xl bg-bg object-cover"
          />

          {/* 통계 — 완주 시간 / 평균 페이스 / 칼로리 (라벨 교정) */}
          <dl className="flex w-full items-center justify-around pt-2">
            <Stat label="완주 시간" value={formatDuration(result.durationSec)} />
            <Divider />
            <Stat label="평균 페이스" value={formatPace(result.avgPaceSecPerKm)} />
            <Divider />
            <Stat label="칼로리" value={String(result.calories)} />
          </dl>
        </section>

        {/* 액션: 메인화면 / 링크복사 / 공유 */}
        <div className="flex gap-2.5">
          <Button
            className="h-14 flex-1 rounded-2xl"
            data-testid="go-main"
            disabled={saving}
            onClick={leaveToMain}
          >
            메인화면
          </Button>
          <Button
            variant="secondary"
            className="h-14 w-14 rounded-2xl"
            aria-label="링크 복사"
            data-testid="copy-link"
            onClick={copyLink}
          >
            🔗
          </Button>
          <Button
            variant="secondary"
            className="h-14 w-14 rounded-2xl"
            aria-label="공유하기"
            data-testid="share"
            onClick={share}
          >
            ↥
          </Button>
        </div>

        {/* 주변 장소 500m */}
        <section className="flex flex-col gap-3">
          <AsyncBoundary
            query={nearbyQuery}
            isEmpty={(places) => places.length === 0}
            emptyMessage="주변에 표시할 장소가 없어요."
            loadingLabel="주변 장소를 불러오는 중..."
            testId="nearby"
          >
            {(places) => <NearbyPlaceList places={places} onSelect={openPlace} />}
          </AsyncBoundary>
        </section>
      </main>

      {confirmOpen && (
        <LeaveConfirmDialog onLogin={confirmLogin} onLeave={leaveWithoutSave} onClose={closeConfirm} />
      )}
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
