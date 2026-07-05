import { useNavigate } from 'react-router-dom';
import type { RunRecord } from '@/domain/types';
import { formatMonthDayWeekday } from '@/shared/format/dateFormat';
import { formatDuration, formatPace } from '@/shared/format/runFormat';

/** V11 기록 목록 카드. 탭 → 상세(V12). lo-fi 스켈레톤. */
export function RecordCard({ record }: { record: RunRecord }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      data-testid={`record-card-${record.id}`}
      onClick={() => navigate(`/records/${record.id}`)}
      className="flex w-full flex-col gap-3 rounded-2xl border border-border bg-surface p-4 text-left"
    >
      <span className="text-m-15 text-text-strong">{formatMonthDayWeekday(record.completedAt)}</span>
      <div className="flex items-end justify-between gap-2">
        <dl className="flex gap-5">
          <Metric label="시간" value={formatDuration(record.durationSec)} />
          <Metric label="페이스" value={formatPace(record.avgPaceSecPerKm)} />
          <Metric label="칼로리" value={String(record.calories)} />
        </dl>
        <span className="text-b-22 text-text-strong">{record.distanceKm}km</span>
      </div>
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-m-12 text-subtle">{label}</dt>
      <dd className="text-sb-15 text-text">{value}</dd>
    </div>
  );
}
