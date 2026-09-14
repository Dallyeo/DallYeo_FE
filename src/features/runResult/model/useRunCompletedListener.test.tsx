import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useRunCompletedListener } from './useRunCompletedListener';
import { useRunResultStore } from './runResultStore';
import { bridgeService } from '@/shared/services/BridgeService';

/** 리스너가 등록한 핸들러를 붙잡아 두고, 테스트가 직접 페이로드를 쏜다 */
let emit: (payload: unknown) => void = () => undefined;
const navigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

function Harness() {
  useRunCompletedListener();
  return null;
}

function mount() {
  render(
    <MemoryRouter>
      <Harness />
    </MemoryRouter>,
  );
}

describe('useRunCompletedListener — runCompleted 페이로드 해석', () => {
  beforeEach(() => {
    navigate.mockClear();
    useRunResultStore.setState({ payload: null });
    vi.spyOn(bridgeService, 'on').mockImplementation((_event, handler) => {
      emit = handler;
      return () => undefined;
    });
  });
  afterEach(() => vi.restoreAllMocks());

  const end = { lat: 35.97, lng: 126.74 };

  it('계약대로 runId에 백엔드 기록 id가 오면 그대로 쓴다', () => {
    mount();
    emit({ runId: 42, end });
    expect(useRunResultStore.getState().payload).toMatchObject({ recordId: '42', end });
    expect(navigate).toHaveBeenCalledWith('/run-result');
  });

  /*
   * 2026-09-14 현재 iOS는 `runId`에 `clientRunId`(UUID 멱등키)를 싣고 진짜 기록 id를
   * `recordId`로 따로 보낸다. 백엔드 `GET /runs/{id}`는 Long이라 UUID면 무조건 400이다.
   * 그래서 키 이름이 아니라 **값의 모양**으로 고른다 — 어느 쪽이 먼저 배포돼도 동작한다.
   */
  it('runId에 UUID가, recordId에 진짜 id가 오면 숫자인 recordId를 고른다 (현재 iOS 구현)', () => {
    mount();
    emit({ runId: '7f3a9c2e-4b1d-4e8a-9c3f-2a1b5d6e7f80', recordId: 7, end });
    expect(useRunResultStore.getState().payload?.recordId).toBe('7');
  });

  it('쓸 수 있는 숫자 id가 하나도 없으면 조회를 포기하되 화면은 띄운다 (좌표로 주변 장소는 동작)', () => {
    mount();
    emit({ runId: '7f3a9c2e-4b1d-4e8a-9c3f-2a1b5d6e7f80', end });
    const payload = useRunResultStore.getState().payload;
    expect(payload?.recordId).toBeUndefined();
    expect(payload?.end).toEqual(end);
    expect(navigate).toHaveBeenCalledWith('/run-result');
  });

  it('이전 계약의 endLocation 키로 와도 받아준다', () => {
    mount();
    emit({ recordId: '3', endLocation: end });
    expect(useRunResultStore.getState().payload).toMatchObject({ recordId: '3', end });
  });

  it('도착 좌표가 없으면 페이로드를 버린다 — 주변 장소도 티켓도 그릴 수 없다', () => {
    mount();
    emit({ recordId: '3' });
    expect(useRunResultStore.getState().payload).toBeNull();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('도장(newAchievements)이 함께 오면 아이콘 경로에 API base를 붙여 담는다', () => {
    mount();
    emit({
      recordId: '1',
      end,
      newAchievements: [
        {
          code: 'PIONEER',
          name: '개척자',
          description: '직접 만든 경로를 완주했다.',
          unlocked: true,
          iconOnUrl: '/images/achievements/pioneer_on.webp',
        },
        'not-an-achievement',
      ],
    });
    const stamps = useRunResultStore.getState().payload?.newAchievements;
    // 모양이 안 맞는 항목은 조용히 버린다 — 도장 하나로 화면 전체를 막지 않는다
    expect(stamps).toHaveLength(1);
    expect(stamps![0]!.iconOnUrl).toMatch(/\/images\/achievements\/pioneer_on\.webp$/);
    expect(stamps![0]!.iconOnUrl).not.toBe('/images/achievements/pioneer_on.webp');
  });
});
