import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { Button } from '@/shared/ui';
import { AsyncBoundary } from '@/shared/ui/AsyncBoundary';
import { formatDistanceKm, formatDuration, formatPace } from '@/shared/format/runFormat';
import { useSessionStore } from '@/shared/auth/sessionStore';
import { useRunResult } from '@/features/runResult/model/useRunResult';
import { useNearbyPlaces } from '@/features/runResult/model/useNearbyPlaces';
import { runResultStore } from '@/features/runResult/model/runResultStore';
import { useCaptureShare } from '@/shared/ui/useCaptureShare';
import { buildDevRunPayload } from '@/features/runResult/model/buildDevRunResult';
import type { Achievement, RunResult } from '@/domain/types';
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

/** 개발 전용: 결과 없이 /run-result 직접 진입 시 mock seed (?runId=기록id, 기본 1). */
function useDevRunResultSeed(hasPayload: boolean): void {
  useEffect(() => {
    // vite dev 서버에서만(test/prod 제외) 자동 seed
    if (import.meta.env.MODE !== 'development' || hasPayload || typeof window === 'undefined')
      return;
    const runId = new URLSearchParams(window.location.search).get('runId') ?? '1';
    runResultStore.getState().setPayload(buildDevRunPayload(runId));
  }, [hasPayload]);
}

/**
 * V10 완주결과뷰.
 *
 * ⚠️ 2026-09-14 계약 변경 — 네이티브가 `POST /runs`로 **저장까지 마친 뒤** 'runCompleted'로
 * **runId와 도착 좌표만** 넘긴다. 이 화면은 그 id로 `GET /runs/{id}`를 불러 그리고,
 * 도착 좌표로 「주변 둘러보기」(공개 API)를 채운다. 웹은 저장하지 않는다.
 *
 * 정적지도 자리에는 네이티브가 올린 경로 이미지(`imageUrl`)가 들어간다(지도 SDK 아님).
 * 티켓은 **탭하면 뜯어진다**(2026-09-06 사용자 결정으로 V12에서 옮겨 옴).
 * 시안(V10_결과 785:2701/2793)에는 완주율 메시지가 없어 화면에 노출하지 않는다
 * — 도메인 로직(`completionMessage`)과 그 테스트는 유지(스펙 재확인 대기).
 */
export function RunResultView() {
  const navigate = useNavigate();
  const {
    payload,
    resultQuery,
    confirmOpen,
    leaveToMain,
    confirmLogin,
    leaveWithoutSave,
    closeConfirm,
    openPlace,
  } = useRunResult();
  const status = useSessionStore((s) => s.status);
  // 주변 장소는 **결과를 기다리지 않는다** — 좌표가 이벤트에 같이 오고 공개 API라 비로그인도 열린다
  const nearbyQuery = useNearbyPlaces(payload?.end);
  const result = resultQuery.data;
  // 티켓만 투명 배경 PNG로 떠서 네이티브 앨범 저장 / 공유 시트로 넘긴다
  const ticket = useCaptureShare({
    fileName: () => `dallyeo-ticket-${result?.runId ?? payload?.runId ?? 'run'}`,
    text: () => (result ? `${formatDistanceKm(result.distanceKm)}km 완주!` : '달여 완주 기록'),
  });
  const [nearbyOpen, setNearbyOpen] = useState(false);
  // 완주 직후 한 번 뜯는 연출 — 화면을 떠나면 초기화된다(기록 상세는 처음부터 뜯긴 상태)
  const [torn, setTorn] = useState(false);

  // dev: 결과 없이 직접 진입하면 mock seed (프로덕션에선 폴백 표시)
  useDevRunResultSeed(!!payload);

  // 이벤트 없이 직접 진입 등 결과 없음 → 폴백 (프로덕션)
  if (!payload) {
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

  return (
    // 화면 전체가 primary인 뷰 — 상태바/홈인디케이터 safe-area까지 함께 칠한다(V12와 동일).
    // 초록을 안쪽 main에만 주면 SafeAreaLayout이 패딩으로 잡은 인셋이 흰 띠로 남는다.
    <SafeAreaLayout bgClass="bg-green-700">
      <main
        data-testid="run-result-view"
        className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto bg-green-700"
      >
        {/* 상단 액션 — 시안: 40×40, 좌16 / 우16, 상단 2 */}
        <div className="flex items-center justify-between px-4 text-off-white">
          <button
            type="button"
            data-testid="go-main"
            aria-label="메인 화면으로"
            onClick={leaveToMain}
            className="flex h-10 w-10 items-center justify-center"
          >
            <IcBack aria-hidden className="h-10 w-10" />
          </button>
          {/* 두 버튼 모두 **티켓 이미지**를 대상으로 한다 — 공유는 네이티브 시트에 PNG 첨부,
              저장은 사진 앨범. (이전의 링크 복사는 `/runs/:id` 라우트도 공개 URL도 없어 죽은 링크였다) */}
          <div className="flex gap-4">
            <button
              type="button"
              data-testid="share"
              aria-label="티켓 공유하기"
              disabled={ticket.busy !== null || !result}
              onClick={ticket.shareImage}
              className="flex h-10 w-10 items-center justify-center disabled:opacity-50"
            >
              <IcLink aria-hidden className="h-[18px] w-auto" />
            </button>
            <button
              type="button"
              data-testid="save-image"
              aria-label="티켓 이미지 저장"
              disabled={ticket.busy !== null || !result}
              onClick={ticket.saveImage}
              className="flex h-10 w-10 items-center justify-center disabled:opacity-50"
            >
              <IcDownload aria-hidden className="h-4 w-auto" />
            </button>
          </div>
        </div>

        {/*
          비로그인이면 기록 자체가 백엔드에 없다 — 네이티브가 저장을 못 했고, 로그인 후에
          네이티브가 재전송한다. 그래서 티켓을 그릴 원본이 없다: 안내만 띄우고,
          좌표로 동작하는 「주변 둘러보기」는 그대로 열어 둔다.
        */}
        {status !== 'authenticated' ? (
          <div
            data-testid="run-result-login-required"
            className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center"
          >
            <p className="text-subheading text-off-white">로그인하면 기록이 저장돼요.</p>
            <p className="text-body text-off-white/80">
              로그인 후에 이번 러닝 기록을 다시 확인할 수 있어요.
            </p>
          </div>
        ) : (
          <AsyncBoundary query={resultQuery} loadingLabel="완주 기록을 불러오는 중..." testId="run-result">
            {(data) => (
              <ResultTicket
                result={data}
                torn={torn}
                onTear={() => setTorn(true)}
                captureRef={ticket.containerRef}
              />
            )}
          </AsyncBoundary>
        )}

        {/* 「주변 둘러보기」 — 텍스트형 버튼. 누르면 모달(스크롤 아님).
            뜯길 때 아랫조각이 40 내려오므로 **같은 곡선으로 함께** 내려간다(안 그러면 글자를 덮는다). */}
        <div
          className={`flex flex-1 items-start justify-center pb-8 pt-8 ${
            torn ? 'ticket-follow--torn' : ''
          }`}
        >
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

/**
 * 결과 티켓 — 시안 `Subtract`(370×655)는 절취선에서 **170 + 485**로 나뉜다.
 * 그래서 한 장이 아니라 **맞닿은 두 조각**으로 그린다: 붙어 있을 땐 반원 노치끼리 만나
 * 시안의 온전한 구멍이 되고, 탭하면 그대로 뜯어진다.
 * 카드 내부 인셋이 요소마다 다름(거리·날짜 29 / 코스명 23 / 지도 20).
 * 세로: 상35 → 거리 → 36 → 코스명 → |절취선 170| → 35 → 지도 → 33 → 통계 → 하34
 */
function ResultTicket({
  result,
  torn,
  onTear,
  captureRef,
}: {
  result: RunResult;
  torn: boolean;
  onTear: () => void;
  captureRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      {/* 저장/공유 캡처 범위 — 두 조각을 함께 담는다.
          패딩만큼 캡처 여유를 두되 같은 크기의 음수 마진으로 상쇄해 **레이아웃은 그대로**다
          (뜯길 때 아랫조각이 40 내려가고 윗조각이 기울어 바깥으로 넘치기 때문). */}
      <div ref={captureRef} className="ticket-capture">
        {/* 그림자는 마스크 바깥 래퍼에 (같은 요소면 잘린다) */}
        <div
          data-capture-part
          className={`ticket-piece ticket-piece--top relative z-10 mx-4 mt-[26px] drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] ${
            torn ? 'ticket-piece--torn' : ''
          }`}
        >
          {/* 윗조각 내부 — 시안 `V12_기록_1`(904:1390) Frame 326 실측.
              패딩 29/23, 내용 블록 324폭. 세로: 29 → 1행(35) → 41 → 2행(28).

              ⚠️ `block`이 아니라 **`flex flex-col`** 이어야 한다 — 버튼은 내용이 짧으면 내용을
              **세로 가운데로 밀어내서**, 패딩 29를 줘도 실제로는 47.5에서 시작했다(실측 18.5 밀림). */}
          <button
            type="button"
            data-testid="ticket-top"
            aria-label={torn ? '티켓이 뜯어졌어요' : '티켓을 눌러 뜯어보세요'}
            onClick={onTear}
            className="ticket-notch ticket-notch--bottom-edge flex h-[170px] w-full flex-col rounded-lg bg-off-white px-[23px] pt-[29px] text-left"
          >
            {/* 1행(Frame 324, 324×35): 거리는 세로 가운데(30 → y+2.5), 날짜블록은 오른쪽.
                날짜블록 오른쪽 끝은 패딩선이 아니라 **332**(=카드 우측에서 38) → pr-[15px] */}
            <div className="flex h-[35px] shrink-0 items-center pr-[15px]">
              <p data-testid="run-distance" className="text-display-lg text-black">
                {formatDistanceKm(result.distanceKm)}km
              </p>
              {/* 날짜/시각(Frame 323, 97×35): 15/15 두 줄 + gap 5 = 35 */}
              <div className="ml-auto flex flex-col items-end gap-[5px] text-right">
                <span className="text-body leading-[15px] text-gray-900">
                  {formatDate(result.completedAt)}
                </span>
                <span className="text-body leading-[15px] text-gray-900">
                  {formatTimeRange(result.startedAt, result.completedAt)}
                </span>
              </div>
            </div>

            {/* 2행(Frame 322, 324×28) — 백엔드가 출발/도착 **지점명을 주지 않는다**(§7.4는
                좌표 2점과 코스명뿐). 그래서 시안의 "청송 과수원 → 신시 전망대" 자리에는
                **코스명**을 넣고, 자유 러닝(코스 없음)이면 빈 자리로 둔다. */}
            {result.courseName && (
              <p
                data-testid="run-route"
                className="mt-[41px] flex h-7 shrink-0 items-center justify-center text-title leading-7 text-black"
              >
                <span className="truncate">{result.courseName}</span>
              </p>
            )}
          </button>
        </div>

        <div
          data-capture-part
          className={`ticket-piece ticket-piece--bottom mx-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] ${
            torn ? 'ticket-piece--torn' : ''
          }`}
        >
          <section className="ticket-notch ticket-notch--top-edge rounded-lg bg-off-white px-5 pb-[34px] pt-[35px]">
            {/* 경로 이미지(줌 없음) — 네이티브가 `POST /runs`에 올린 그림을 그대로 받아 쓴다.
                시안 정사각 330 r16. 스탬프(Group 130, 120×120)는 우하단에 걸쳐 바깥으로 넘치고
                살짝 기울어져 있다. 이미지가 아직 없으면(업로드 실패 등) 회색 자리만 남긴다. */}
            <div className="relative">
              {result.routeImageUrl ? (
                <img
                  src={result.routeImageUrl}
                  alt="완주 경로 이미지"
                  data-testid="route-map"
                  className="aspect-square w-full rounded-lg bg-gray-200 object-cover"
                />
              ) : (
                <div
                  data-testid="route-map"
                  className="flex aspect-square w-full items-center justify-center rounded-lg bg-gray-200 text-body-sm text-gray-500"
                >
                  경로 이미지
                </div>
              )}
              <img
                src={runStamp}
                alt=""
                aria-hidden
                data-testid="run-stamp"
                className="pointer-events-none absolute bottom-[-35px] right-[-22px] h-[120px] w-[120px] rotate-[-2.82deg]"
              />
            </div>

            {/* 통계 — 진행 시간 / 최고 페이스 / 칼로리.
                칼로리는 **서버가 계산하지 않는다** — 네이티브가 저장할 때 보낸 값(HealthKit)이
                그대로 돌아온다(§7.1). 안 보냈으면 키가 없으므로 '-'로 둔다. */}
            <dl className="mt-[33px] flex items-center justify-center gap-5">
              <Stat label="진행 시간" value={formatDuration(result.durationSec)} />
              <Divider />
              <Stat label="최고 페이스" value={formatPace(result.avgPaceSecPerKm)} />
              <Divider />
              <Stat
                label="칼로리"
                value={result.calories !== undefined ? String(result.calories) : '-'}
              />
            </dl>
          </section>
        </div>
      </div>

      {/* 이번 러닝으로 **처음 달성한** 업적 도장 (§7.1 newAchievements). 최대 7개까지 온다.
          없으면(대부분) 아무것도 그리지 않는다 — 재달성은 두 번 다시 내려오지 않는다. */}
      {result.newAchievements && result.newAchievements.length > 0 && (
        <NewAchievementStamps achievements={result.newAchievements} torn={torn} />
      )}
    </>
  );
}

/** 새로 딴 업적 도장 줄 — 시안에 자리가 없어 티켓 아래에 덧붙인다(있을 때만 노출) */
function NewAchievementStamps({
  achievements,
  torn,
}: {
  achievements: Achievement[];
  torn: boolean;
}) {
  return (
    <div
      data-testid="new-achievements"
      className={`flex flex-col items-center gap-3 px-4 pt-10 ${torn ? 'ticket-follow--torn' : ''}`}
    >
      <p className="text-subheading text-off-white">새로 획득한 업적</p>
      <ul className="flex flex-wrap items-start justify-center gap-4">
        {achievements.map((a) => (
          <li
            key={a.code}
            data-testid={`new-achievement-${a.code}`}
            className="flex w-20 flex-col items-center gap-1.5"
          >
            {a.iconOnUrl ? (
              <img src={a.iconOnUrl} alt="" aria-hidden className="h-20 w-20 object-contain" />
            ) : (
              <span aria-hidden className="h-20 w-20 rounded-full bg-off-white/20" />
            )}
            <span className="text-center text-caption text-off-white">{a.name}</span>
          </li>
        ))}
      </ul>
    </div>
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
