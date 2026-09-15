import type { RefObject } from 'react';
import type { TicketRecord } from '@/features/records/model/useRecordPages';
import { formatDistanceKm, formatDuration, formatPace } from '@/shared/format/runFormat';

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
 * 기록 티켓 한 장 (시안 `V12_기록_후_new` 999:3422).
 *
 * 티켓은 **이미 뜯긴 상태로 고정**된다 — 뜯는 애니메이션은 V10 완주결과뷰로 옮겼다
 * (2026-09-06 사용자 결정). 기록 상세는 "완주해서 뜯어낸 티켓"을 보관함에서 꺼내 보는 화면이라
 * 볼 때마다 다시 뜯는 연출이 맞지 않는다.
 *
 * 좌우 페이징 트랙에 **이웃 기록도 함께** 렌더되므로, 화면에 보이는 한 장(`active`)만
 * 테스트 훅과 캡처 대상을 갖는다(같은 testid가 세 벌 잡히지 않게).
 */
export function RecordTicket({
  record,
  active = false,
  captureRef,
}: {
  record: TicketRecord;
  active?: boolean;
  captureRef?: RefObject<HTMLDivElement | null> | undefined;
}) {
  /** 보이지 않는 옆 장은 테스트·캡처 대상이 아니다 */
  const tid = (name: string) => (active ? name : undefined);

  return (
    // 페이징 트랙의 한 칸 — 폭은 화면 하나, 줄어들지 않는다
    <div className="w-full shrink-0" {...(active ? {} : { 'aria-hidden': true })}>
      {/* 저장/공유 캡처 범위 — 두 조각을 함께 담는다(윗조각이 기울어 바깥으로 넘친다) */}
      <div ref={active ? (captureRef ?? null) : null} className="ticket-capture">
        {/* ── 윗조각 — 뜯긴 포즈로 고정. 시안 370×170, 내부 좌우 23 / 상 29 / 하 37 ── */}
        {/* 그림자는 **바깥 래퍼**에 — 마스크와 같은 요소에 filter를 주면 그림자가 잘려 사라진다 */}
        <div
          data-capture-part
          className="ticket-piece ticket-piece--top ticket-piece--settled relative z-10 mx-4 mt-9 drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
        >
          <div
            data-testid={tid('ticket-top')}
            className="ticket-notch ticket-notch--bottom-edge block w-full rounded-lg bg-off-white px-[23px] pb-[37px] pt-[29px] text-left"
          >
            {/* 1행(Frame 324, 324×35): 거리는 세로 가운데(30 → y+2.5), 날짜블록은 오른쪽.
              날짜블록 오른쪽 끝은 패딩선(23)이 아니라 **카드 우측에서 38** → pr-[15px].
              행간은 시안 15(우리 body는 15/20) → leading을 죈다 */}
            <div className="flex h-[35px] items-center pr-[15px]">
              <p data-testid={tid('record-distance')} className="text-display-lg text-black">
                {formatDistanceKm(record.distanceKm)}km
              </p>
              <div className="ml-auto flex flex-col items-end gap-[5px] text-right">
                <span className="text-body leading-[15px] text-gray-900">
                  {formatDate(record.completedAt)}
                </span>
                <span className="text-body leading-[15px] text-gray-900">
                  {formatTimeRange(record.startedAt, record.completedAt)}
                </span>
              </div>
            </div>

            {/* 2행(Frame 322, 324×28) — 백엔드가 출발/도착 **지점명을 주지 않는다**(2026-09-14
              계약 변경: 좌표 2점 + 코스명뿐). 시안의 "청송 과수원 → 신시 전망대" 자리에는
              **코스명**을 넣고, 자유 러닝(코스 없음)이면 빈 자리로 둔다. */}
            {record.courseName && (
              <div
                data-testid={tid('record-route')}
                className="mt-[41px] flex h-7 items-center justify-center text-title leading-7 text-black"
              >
                <span className="truncate">{record.courseName}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── 아랫조각 — 시안 370×485, 지도 330 정사각 r16(내부 20), 통계 간격 30.
          뜯긴 상태에서도 아랫조각은 **제자리 그대로**다(시안 실측). ── */}
        <div
          data-capture-part
          className="ticket-piece ticket-piece--bottom mx-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
        >
          <section className="ticket-notch ticket-notch--top-edge rounded-lg bg-off-white px-5 pb-[34px] pt-[35px]">
            {/* 경로 이미지 — 네이티브가 `POST /runs`에 올린 그림(`imageUrl`)을 그대로 받아 쓴다.
              완주 스탬프는 새 시안(V12_기록_후_new)에서 빠졌다. */}
            {record.routeImageUrl ? (
              <img
                src={record.routeImageUrl}
                alt="완주 경로 이미지"
                data-testid={tid('route-map')}
                className="aspect-square w-full rounded-lg bg-gray-200 object-cover"
              />
            ) : (
              <div
                data-testid={tid('route-map')}
                className="flex aspect-square w-full items-center justify-center rounded-lg bg-gray-200 text-body-sm text-gray-500"
              >
                경로 이미지
              </div>
            )}

            <dl className="mt-[30px] flex items-center justify-center gap-5">
              <Stat label="진행 시간" value={formatDuration(record.durationSec)} />
              <Divider />
              <Stat label="최고 페이스" value={formatPace(record.avgPaceSecPerKm)} />
              <Divider />
              <Stat
                label="칼로리"
                value={record.calories !== undefined ? String(record.calories) : '-'}
              />
            </dl>
          </section>
        </div>
      </div>

      {/* 공유 / 저장은 **앱바 우측**으로 옮겼다(V10_결과_출시버전과 동일) — 티켓 바깥이라
          페이징 트랙을 따라 밀리지 않고 한 벌만 존재한다. */}
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
  return <span aria-hidden className="h-12 w-px bg-gray-250" />;
}
