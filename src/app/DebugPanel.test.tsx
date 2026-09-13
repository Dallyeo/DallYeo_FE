import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DebugPanel } from './DebugPanel';
import { clearLogs, logger } from '@/shared/observability/logger';

describe('DebugPanel (실기기 진단)', () => {
  beforeEach(() => {
    clearLogs();
    window.localStorage.clear();
  });

  it('플래그가 없으면 아무것도 렌더하지 않는다 — 평소 화면을 건드리지 않게', () => {
    render(<DebugPanel />);
    expect(screen.queryByTestId('debug-open')).not.toBeInTheDocument();
  });

  it('플래그가 켜지면 로그 버퍼를 화면에 그대로 보여준다', () => {
    window.localStorage.setItem('dallyeo.debug', 'true');
    logger.error('run_save_failed', { status: 400, code: 'VALIDATION_ERROR' });
    render(<DebugPanel />);

    fireEvent.click(screen.getByTestId('debug-open'));

    const report = screen.getByTestId('debug-report');
    expect(report).toHaveTextContent('run_save_failed');
    expect(report).toHaveTextContent('VALIDATION_ERROR');
    // 환경 요약도 함께 — "요청이 어디로 나갔는가"가 첫 번째 질문이다
    expect(report).toHaveTextContent('apiBaseUrl=');
    expect(report).toHaveTextContent('bridge=');
  });

  it('패널이 열린 뒤 들어온 로그도 즉시 반영된다', () => {
    window.localStorage.setItem('dallyeo.debug', 'true');
    render(<DebugPanel />);
    fireEvent.click(screen.getByTestId('debug-open'));

    act(() => logger.info('runCompleted_received', { payload: { distanceKm: 0 } }));

    expect(screen.getByTestId('debug-report')).toHaveTextContent('runCompleted_received');
  });

  it('두 손가락 1.2초 길게 누르면 켜진다 — 앱에는 주소창이 없다', () => {
    vi.useFakeTimers();
    try {
      render(<DebugPanel />);
      fireEvent.touchStart(window, { touches: [{ clientX: 10 }, { clientX: 100 }] });
      act(() => vi.advanceTimersByTime(1300));
      expect(screen.getByTestId('debug-panel')).toBeInTheDocument();
      expect(window.localStorage.getItem('dallyeo.debug')).toBe('true');
    } finally {
      vi.useRealTimers();
    }
  });
});
