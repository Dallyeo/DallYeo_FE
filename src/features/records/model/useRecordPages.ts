import { useQueries } from '@tanstack/react-query';
import type { RunRecord, RunRecordDetail } from '@/domain/types';
import { useRecords } from '@/features/records/model/useRecords';
import { recordDetailQuery } from '@/features/records/model/useRecordDetail';

/** 티켓 한 장을 그리는 데 필요한 만큼 — 상세가 아직 없으면 목록 요약으로도 그린다. */
export type TicketRecord = RunRecord & Partial<Omit<RunRecordDetail, keyof RunRecord>>;

export interface RecordPage {
  id: string;
  record: TicketRecord | undefined;
}

/**
 * V12 좌우 페이징용 [이전 · 현재 · 다음] 세 장.
 *
 * 목록은 **최신순**이므로 앞 인덱스가 더 최근(previous), 뒤 인덱스가 더 과거(next)다.
 * V11의 기간 탭과 무관하게 **전체 목록**을 기준으로 넘긴다 — V12는 딥링크로도 열리고,
 * 그때 기간 필터를 알 방법이 없어 화면마다 넘어가는 범위가 달라지면 예측이 어렵다.
 *
 * 이웃 상세를 **미리 받아둔다**(`useQueries`). 밀려 들어오는 티켓이 스피너면 종이 넘기는
 * 느낌이 깨지기 때문. 아직 안 왔으면 목록 요약으로 먼저 그리고, 도착하면 조용히 채워진다.
 * 목록·상세 모두 react-query 캐시를 타므로 V11을 거쳐 들어오면 추가 요청이 거의 없다.
 */
export function useRecordPages(recordId: string | undefined, enabled: boolean) {
  const listQuery = useRecords(enabled);
  const records = listQuery.data ?? [];
  const at = recordId ? records.findIndex((record) => record.id === recordId) : -1;

  // 목록에 없는 id(로딩 중·삭제됨·딥링크)면 현재 한 장만 — 스와이프는 자연히 막힌다
  const ids =
    at >= 0
      ? [records[at - 1]?.id, records[at]?.id, records[at + 1]?.id].filter(
          (id): id is string => !!id,
        )
      : recordId
        ? [recordId]
        : [];

  const details = useQueries({
    queries: ids.map((id) => ({ ...recordDetailQuery(id) })),
  });

  const pages: RecordPage[] = ids.map((id, i) => ({
    id,
    record: details[i]?.data ?? records.find((record) => record.id === id),
  }));

  return {
    pages,
    /** `pages` 안에서 현재 기록의 위치 */
    index: Math.max(
      pages.findIndex((page) => page.id === recordId),
      0,
    ),
  };
}
