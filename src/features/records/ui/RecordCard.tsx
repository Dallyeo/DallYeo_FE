import { useNavigate } from 'react-router-dom';
import type { RunRecord } from '@/domain/types';
import { formatDuration, formatPace } from '@/shared/format/runFormat';
import IcChevron from '@/shared/ui/icons/ic-chevron-forward.svg?react';

/** "26/06/10(금)" */
function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return `${String(d.getFullYear()).slice(2)}/${p(d.getMonth() + 1)}/${p(d.getDate())}(${weekday})`;
}

/**
 * V11 기록 행 (V11_기록_주간 682:1385 Frame 334). 탭 → 상세(V12).
 * 행 높이 72: 좌측 거리(`heading`)+날짜(`overline`), 중앙 3열(각 50폭·`body`), 우측 chevron.
 * 하단 구분선 0.5px.
 */
export function RecordCard({ record }: { record: RunRecord }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      data-testid={`record-card-${record.id}`}
      onClick={() => navigate(`/records/${record.id}`)}
      className="flex h-[72px] w-full items-center border-b-[0.5px] border-gray-250 pl-[1px] pr-[1px] text-left"
    >
      <span className="flex w-[65px] shrink-0 flex-col">
        <span className="text-heading text-black">{record.distanceKm}km</span>
        <span className="text-overline text-gray-500">{formatShortDate(record.completedAt)}</span>
      </span>

      <dl className="flex flex-1 justify-around">
        <Metric value={formatDuration(record.durationSec)} />
        <Metric value={formatPace(record.avgPaceSecPerKm)} />
        {/* 칼로리는 백엔드 명세에 없는 필드 — 없으면 '-' */}
        <Metric value={record.calories !== undefined ? String(record.calories) : '-'} />
      </dl>

      <span aria-hidden className="flex w-6 shrink-0 justify-center text-gray-300">
        <IcChevron className="h-3 w-auto" />
      </span>
    </button>
  );
}

function Metric({ value }: { value: string }) {
  return <dd className="w-[50px] text-center text-body text-gray-900">{value}</dd>;
}

/** 리스트 상단 컬럼 헤더 — 시안 Group 132 (시간/페이스/칼로리, overline gray-500) */
export function RecordListHeader() {
  return (
    <div className="flex items-center border-b border-gray-250 pb-[8px]">
      <span className="w-[65px] shrink-0" />
      <div className="flex flex-1 justify-around">
        {['시간', '페이스', '칼로리'].map((label) => (
          <span key={label} className="w-[50px] text-center text-overline text-gray-500">
            {label}
          </span>
        ))}
      </div>
      <span className="w-6 shrink-0" />
    </div>
  );
}
