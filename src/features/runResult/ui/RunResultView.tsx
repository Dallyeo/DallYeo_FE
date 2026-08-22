import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { Button } from '@/shared/ui';
import { formatDistanceKm, formatDuration, formatPace } from '@/shared/format/runFormat';
import { useRunResult } from '@/features/runResult/model/useRunResult';
import { useNearbyPlaces } from '@/features/runResult/model/useNearbyPlaces';
import { runResultStore } from '@/features/runResult/model/runResultStore';
import { buildDevRunResult } from '@/features/runResult/model/buildDevRunResult';
import { NearbyPlacesModal } from './NearbyPlacesModal';
import { LeaveConfirmDialog } from './LeaveConfirmDialog';
import IcBack from '@/shared/ui/icons/ic-back.svg?react';
import IcLink from '@/shared/ui/icons/ic-link-2.svg?react';
import IcDownload from '@/shared/ui/icons/ic-download.svg?react';
import runStamp from '@/shared/ui/images/run-stamp.png';

/** "2026/07/20" */
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())}`;
}

/** "12:00 - 12:30" (시작 시각이 없으면 완주 시각만) */
function formatTimeRange(startIso: string | undefined, endIso: string): string {
  const hm = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  const end = hm(endIso);
  const start = startIso ? hm(startIso) : '';
  return start ? `${start} - ${end}` : end;
}

/** 개발 전용: 결과 없이 /run-result 직접 진입 시 mock seed (?rate=완주율%, 기본 100). */
function useDevRunResultSeed(hasResult: boolean): void {
  useEffect(() => {
    // vite dev 서버에서만(test/prod 제외) 자동 seed
    if (import.meta.env.MODE !== 'development' || hasResult || typeof window === 'undefined')
      return;
    const raw = Number(new URLSearchParams(window.location.search).get('rate'));
    const rate = Number.isFinite(raw) && raw > 0 ? Math.min(raw, 100) : 100;
    runResultStore.getState().setResult(buildDevRunResult(rate));
  }, [hasResult]);
}

/**
 * V10 완주결과뷰 (lo-fi 스켈레톤). 'runCompleted' 이벤트로 채워진 store 기반.
 * 정적지도·통계·「주변 둘러보기」 모달. 저장 게이팅은 useRunResult가 담당.
 * 시안(V10_결과 785:2701/2793)에는 완주율 메시지가 없어 화면에 노출하지 않는다
 * — 도메인 로직(`completionMessage`)과 그 테스트는 유지(스펙 재확인 대기).
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
  const [nearbyOpen, setNearbyOpen] = useState(false);

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

  const route = [result.startPlaceName, result.endPlaceName].filter(Boolean);

  return (
    <SafeAreaLayout>
      <main
        data-testid="run-result-view"
        className="flex flex-1 flex-col overflow-y-auto bg-green-700"
      >
        {/* 상단 액션 — 시안: 40×40, 좌16 / 우16, 상단 2 */}
        <div className="flex items-center justify-between px-4 pt-safe-top text-off-white">
          <button
            type="button"
            data-testid="go-main"
            aria-label="메인 화면으로"
            disabled={saving}
            onClick={leaveToMain}
            className="flex h-10 w-10 items-center justify-center"
          >
            <IcBack aria-hidden className="h-10 w-10" />
          </button>
          <div className="flex gap-4">
            <button
              type="button"
              data-testid="copy-link"
              aria-label="링크 복사"
              onClick={copyLink}
              className="flex h-10 w-10 items-center justify-center"
            >
              <IcLink aria-hidden className="h-[18px] w-auto" />
            </button>
            <button
              type="button"
              data-testid="share"
              aria-label="공유하기"
              onClick={share}
              className="flex h-10 w-10 items-center justify-center"
            >
              <IcDownload aria-hidden className="h-4 w-auto" />
            </button>
          </div>
        </div>

        {/* 결과 카드 — 시안 `Subtract`: 양옆 노치가 있는 **티켓 모양**(global.css `.ticket-card`).
            카드 내부 인셋이 요소마다 다름(거리·날짜 29 / 코스명 23 / 지도 20).
            세로: 상35 → 거리 → 36 → 코스명 → 72 → 지도 → 30 → 통계 → 하34 */}
        {/* 그림자는 마스크 바깥 래퍼에 (같은 요소면 잘린다) */}
        <div className="mx-4 mt-[26px] drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
        <section className="ticket-card rounded-lg bg-off-white px-5 pb-[34px] pt-[35px]">
          <div className="flex items-start justify-between gap-3 px-[9px]">
            <p data-testid="run-distance" className="text-display-lg text-black">
              {formatDistanceKm(result.distanceKm)}km
            </p>
            <div className="flex flex-col items-end gap-1">
              <span className="text-body text-gray-900">{formatDate(result.completedAt)}</span>
              <span className="text-body text-gray-900">
                {formatTimeRange(result.startedAt, result.completedAt)}
              </span>
            </div>
          </div>

          {route.length > 0 && (
            <p data-testid="run-route" className="mt-9 px-[3px] text-title text-black">
              {route.join(' → ')}
            </p>
          )}

          {/* 정적 지도(줌 없음) — 시안 정사각 330 r16.
              스탬프(Group 130, 126×126)는 지도 우하단에 걸쳐 바깥으로 넘침 */}
          <div className="relative mt-[72px]">
            <img
              src={result.staticMapImageUrl}
              alt="완주 경로 지도"
              className="aspect-square w-full rounded-lg bg-gray-200 object-cover"
            />
            <img
              src={runStamp}
              alt=""
              aria-hidden
              data-testid="run-stamp"
              className="pointer-events-none absolute bottom-[-35px] right-[-28px] h-[126px] w-[126px]"
            />
          </div>

          {/* 통계 — 진행 시간 / 최고 페이스 / 칼로리 */}
          <dl className="mt-[33px] flex items-center justify-center gap-5">
            <Stat label="진행 시간" value={formatDuration(result.durationSec)} />
            <Divider />
            <Stat label="최고 페이스" value={formatPace(result.avgPaceSecPerKm)} />
            <Divider />
            <Stat label="칼로리" value={String(result.calories)} />
          </dl>
        </section>
        </div>

        {/* 「주변 둘러보기」 — 텍스트형 버튼. 누르면 모달(스크롤 아님). */}
        <div className="flex flex-1 items-start justify-center pb-8 pt-8">
          <button
            type="button"
            data-testid="open-nearby"
            onClick={() => setNearbyOpen(true)}
            className="text-subheading text-white underline"
          >
            주변 둘러보기
          </button>
        </div>
      </main>

      {/* 시트는 즉시 열리고 로딩/빈 상태는 시트 **안에서** 처리한다 */}
      <NearbyPlacesModal
        query={nearbyQuery}
        isOpen={nearbyOpen}
        onClose={() => setNearbyOpen(false)}
        onSelect={openPlace}
      />

      {confirmOpen && (
        <LeaveConfirmDialog
          onLogin={confirmLogin}
          onLeave={leaveWithoutSave}
          onClose={closeConfirm}
        />
      )}
    </SafeAreaLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-[3px]">
      <dd className="text-heading text-black">{value}</dd>
      <dt className="text-body-sm text-gray-500">{label}</dt>
    </div>
  );
}

function Divider() {
  return <span aria-hidden className="h-14 w-px bg-gray-250" />;
}
