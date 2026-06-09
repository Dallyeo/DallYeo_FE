import type { ReactNode } from 'react';
import { Spinner } from './Spinner';
import { Button } from './Button';

interface QueryLike<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * 비동기 데이터 로딩/에러/빈 상태 표준화 (U3-P1, SECURITY-15).
 * isEmpty 판정은 호출부가 제공(기본: 배열 길이 0).
 */
export function AsyncBoundary<T>({
  query,
  children,
  isEmpty,
  emptyMessage = '표시할 내용이 없어요.',
  loadingLabel,
  testId = 'async-boundary',
}: {
  query: QueryLike<T>;
  children: (data: T) => ReactNode;
  isEmpty?: (data: T) => boolean;
  emptyMessage?: string;
  loadingLabel?: string;
  testId?: string;
}) {
  if (query.isLoading) return <Spinner {...(loadingLabel ? { label: loadingLabel } : {})} />;

  if (query.isError) {
    return (
      <div data-testid={`${testId}-error`} className="flex flex-col items-center gap-3 p-6">
        <p className="text-danger">불러오지 못했어요.</p>
        <Button variant="secondary" data-testid={`${testId}-retry`} onClick={() => query.refetch()}>
          다시 시도
        </Button>
      </div>
    );
  }

  const data = query.data;
  if (data === undefined) return <Spinner {...(loadingLabel ? { label: loadingLabel } : {})} />;

  if (isEmpty?.(data)) {
    return (
      <div data-testid={`${testId}-empty`} className="p-6 text-center text-muted">
        {emptyMessage}
      </div>
    );
  }

  return <>{children(data)}</>;
}
