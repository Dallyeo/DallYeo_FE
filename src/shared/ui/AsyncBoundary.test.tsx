import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AsyncBoundary } from './AsyncBoundary';

interface QueryStub {
  data: number[] | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

function setup(query: QueryStub) {
  return render(
    <AsyncBoundary query={query} isEmpty={(d) => d.length === 0}>
      {(data) => <div data-testid="content">{data.length}개</div>}
    </AsyncBoundary>,
  );
}

describe('AsyncBoundary (U3-P1)', () => {
  it('로딩 → Spinner', () => {
    setup({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() });
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('에러 → 재시도 버튼, 클릭 시 refetch', () => {
    const refetch = vi.fn();
    setup({ data: undefined, isLoading: false, isError: true, refetch });
    fireEvent.click(screen.getByTestId('async-boundary-retry'));
    expect(refetch).toHaveBeenCalled();
  });

  it('빈 데이터 → empty', () => {
    setup({ data: [], isLoading: false, isError: false, refetch: vi.fn() });
    expect(screen.getByTestId('async-boundary-empty')).toBeInTheDocument();
  });

  it('데이터 → children 렌더', () => {
    setup({ data: [1, 2], isLoading: false, isError: false, refetch: vi.fn() });
    expect(screen.getByTestId('content')).toHaveTextContent('2개');
  });
});
