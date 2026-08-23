import { useState, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { RunRecordDetail } from '@/domain/types';
import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { AsyncBoundary } from '@/shared/ui/AsyncBoundary';
import { bridgeService } from '@/shared/services/BridgeService';
import { toast } from '@/shared/ui/toastStore';
import { formatDistanceKm, formatDuration, formatPace } from '@/shared/format/runFormat';
import { useRecordDetail } from '@/features/records/model/useRecordDetail';
import IcBack from '@/shared/ui/icons/ic-back.svg?react';
import IcLink from '@/shared/ui/icons/ic-link-2.svg?react';
import IcDownload from '@/shared/ui/icons/ic-download.svg?react';
import runStamp from '@/shared/ui/images/run-stamp.png';

/** "7월 20일 (일)" */
function formatTitleDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${weekday})`;
}

/** "2026/07/20" */
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())}`;
}

/** "12:00 - 12:30" */
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

/**
 * 출발지 → 도착지.
 * 지정 코스면 코스의 출발/도착 지점명, **사용자 지정 코스면 출발지를 "지정된 위치"**로 표기한다.
 * (자유 러닝은 출발점이 검색된 장소가 아니므로 이름이 없다.)
 */
function resolveRoutePoints(detail: RunRecordDetail): { start: string; end: string } | null {
  if (detail.startPlaceName && detail.endPlaceName) {
    return { start: detail.startPlaceName, end: detail.endPlaceName };
  }
  if (detail.endPlaceName) return { start: '지정된 위치', end: detail.endPlaceName };
  return null;
}

/**
 * V12 기록 상세 (V12_기록_전 904:1390 / V12_기록_후 615:1484).
 * 티켓 윗조각(370×170)이 아랫조각(370×485)과 맞닿아 있다가 **터치하면 뜯긴다**
 * — 중심 기준 -3.99° 회전 + 위로 10.5px(시안 relativeTransform 실측값).
 */
export function RecordDetailView() {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const detailQuery = useRecordDetail(recordId);
  const [torn, setTorn] = useState(false);

  function share(detail: RunRecordDetail): void {
    // ⚠️ 공유 이미지 형태 미합의 — 현재는 텍스트/링크만 전달(버튼 배선 유지)
    bridgeService.share({
      title: '달여 러닝 기록',
      text: `${formatDistanceKm(detail.distanceKm)}km 완주!`,
    });
  }

  async function copyLink(detail: RunRecordDetail): Promise<void> {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/records/${detail.id}`);
      toast.show('링크를 복사했어요.');
    } catch {
      toast.show('링크 복사에 실패했어요.');
    }
  }

  return (
    // 상태바(safe-area)까지 primary로 채운다 — iOS에서 상단이 흰 띠로 남지 않게
    // 네비게이션바 화면은 상단 여백을 줄인다
    <SafeAreaLayout topInset={false} bgClass="bg-green-700" style={{ '--screen-top-gap': '6px' } as CSSProperties}>
      <AsyncBoundary query={detailQuery} loadingLabel="기록을 불러오는 중..." testId="record-detail">
        {(detail) => {
          const route = resolveRoutePoints(detail);
          return (
            <main
              data-testid="record-detail-view"
              className="relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto bg-green-700"
            >
              {/* 앱바 — 뒤로 40×40(좌16) / 가운데 날짜.
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

              {/* ── 윗조각 — 탭하면 뜯긴다. 시안 370×170, 내부 좌우 23 / 상 29 / 하 37 ── */}
              {/* 그림자는 **바깥 래퍼**에 — 마스크와 같은 요소에 filter를 주면 그림자가 잘려 사라진다 */}
              <div
                className={`ticket-piece ticket-piece--top relative z-10 mx-4 mt-9 drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] ${
                  torn ? 'ticket-piece--torn' : ''
                }`}
              >
              <button
                type="button"
                data-testid="ticket-top"
                aria-label={torn ? '티켓이 뜯어졌어요' : '티켓을 눌러 뜯어보세요'}
                onClick={() => setTorn(true)}
                className="ticket-notch ticket-notch--bottom-edge block w-full rounded-lg bg-off-white px-[23px] pb-[37px] pt-[29px] text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <p data-testid="record-distance" className="text-display-lg text-black">
                    {formatDistanceKm(detail.distanceKm)}km
                  </p>
                  {/* 시안은 행간 15(우리 body는 15/20) — 카드 높이 170을 맞추려면 leading을 죄야 한다 */}
                  <div className="flex flex-col items-end gap-[5px] pt-[3px]">
                    <span className="text-body leading-[15px] text-gray-900">
                      {formatDate(detail.completedAt)}
                    </span>
                    <span className="text-body leading-[15px] text-gray-900">
                      {formatTimeRange(detail.startedAt, detail.completedAt)}
                    </span>
                  </div>
                </div>

                {/* 출발지 → 도착지 — 시안 간격 41 */}
                {route && (
                  <div
                    data-testid="record-route"
                    className="mt-[41px] flex items-center justify-between gap-2"
                  >
                    <span className="flex-1 truncate text-title text-black">{route.start}</span>
                    <span aria-hidden className="shrink-0 text-heading text-gray-900">
                      →
                    </span>
                    <span className="flex-1 truncate text-right text-title text-black">
                      {route.end}
                    </span>
                  </div>
                )}

              </button>
              </div>

              {/* ── 아랫조각 — 시안 370×485, 지도 330 정사각 r16(내부 20), 통계 간격 30 ── */}
              <div
                className={`ticket-piece ticket-piece--bottom mx-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] ${
                  torn ? 'ticket-piece--torn' : ''
                }`}
              >
              <section className="ticket-notch ticket-notch--top-edge rounded-lg bg-off-white px-5 pb-[34px] pt-[35px]">
                <div className="relative">
                  {/* 정적 경로 이미지 자리 — 백엔드가 지도 URL을 주면 여기에 들어간다 */}
                  <div
                    data-testid="route-map"
                    className="flex aspect-square w-full items-center justify-center rounded-lg bg-gray-200 text-body-sm text-gray-500"
                  >
                    경로 이미지
                  </div>
                  <img
                    src={runStamp}
                    alt=""
                    aria-hidden
                    data-testid="record-stamp"
                    className="pointer-events-none absolute bottom-[-35px] right-[-28px] h-[126px] w-[126px]"
                  />
                </div>

                <dl className="mt-[30px] flex items-center justify-center gap-5">
                  <Stat label="진행 시간" value={formatDuration(detail.durationSec)} />
                  <Divider />
                  <Stat label="최고 페이스" value={formatPace(detail.avgPaceSecPerKm)} />
                  <Divider />
                  <Stat
                    label="칼로리"
                    value={detail.calories !== undefined ? String(detail.calories) : '-'}
                  />
                </dl>
              </section>
              </div>

              {/* 링크복사 / 저장 — 우하단. 아랫조각 낙차(+40)를 키운 만큼 위아래 여유를 더 뒀다 */}
              <div className="flex justify-end gap-7 pb-[44px] pr-[28px] pt-[62px] text-off-white">
                <button
                  type="button"
                  data-testid="record-copy-link"
                  aria-label="링크 복사"
                  onClick={() => void copyLink(detail)}
                  className="flex h-6 w-6 items-center justify-center"
                >
                  <IcLink aria-hidden className="h-[18px] w-auto" />
                </button>
                <button
                  type="button"
                  data-testid="record-share"
                  aria-label="공유하기"
                  onClick={() => share(detail)}
                  className="flex h-6 w-6 items-center justify-center"
                >
                  <IcDownload aria-hidden className="h-4 w-auto" />
                </button>
              </div>
            </main>
          );
        }}
      </AsyncBoundary>
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
  return <span aria-hidden className="h-12 w-px bg-gray-250" />;
}
