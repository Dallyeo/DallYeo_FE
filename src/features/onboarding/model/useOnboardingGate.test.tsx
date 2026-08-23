import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useSessionStore } from '@/shared/auth/sessionStore';
import { onboardingRepository } from '@/features/onboarding/api/onboardingRepository';
import { profileRepository } from '@/features/settings/api/profileRepository';
import { useOnboardingGate } from './useOnboardingGate';

vi.mock('@/features/settings/api/profileRepository', () => ({
  profileRepository: { get: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));

const mockGet = vi.mocked(profileRepository.get);
const mockUpdate = vi.mocked(profileRepository.update);

function Probe() {
  useOnboardingGate();
  return <span data-testid="path">{useLocation().pathname}</span>;
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="*" element={<Probe />} />
      </Routes>
    </MemoryRouter>,
  );
}

const at = () => screen.getByTestId('path').textContent;

describe('useOnboardingGate (온보딩 진입 판단)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    useSessionStore.setState({ status: 'unknown', session: null });
    mockUpdate.mockResolvedValue({ nickname: '달여' });
  });

  it('부트스트랩 중(unknown)에는 판단하지 않는다', async () => {
    renderAt('/main');
    await new Promise((r) => setTimeout(r, 0));
    expect(at()).toBe('/main');
  });

  it('게스트 + 플래그 없음 → 온보딩으로', async () => {
    useSessionStore.setState({ status: 'unauthenticated', session: null });
    renderAt('/main');
    await waitFor(() => expect(at()).toBe('/onboarding'));
    expect(mockGet).not.toHaveBeenCalled(); // 토큰이 없으니 서버에 묻지 않는다
  });

  it('게스트 + 플래그 있음 → 그대로', async () => {
    await onboardingRepository.markCompleted();
    useSessionStore.setState({ status: 'unauthenticated', session: null });
    renderAt('/main');
    await new Promise((r) => setTimeout(r, 0));
    expect(at()).toBe('/main');
  });

  it('회원 + 서버에 신체정보 있음 → 플래그가 없어도 통과 (기기 교체)', async () => {
    mockGet.mockResolvedValue({ nickname: '달여', heightCm: 175, weightKg: 65 });
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    renderAt('/main');
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 0));
    expect(at()).toBe('/main');
    // 다음 실행을 위해 이 기기 플래그도 맞춰둔다
    expect((await onboardingRepository.getState()).completed).toBe(true);
  });

  it('회원 + 서버 신체정보 없음 → 로컬 플래그가 있어도 온보딩으로 (신규 가입)', async () => {
    await onboardingRepository.markCompleted();
    mockGet.mockResolvedValue({ nickname: '달여' });
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    renderAt('/main');
    await waitFor(() => expect(at()).toBe('/onboarding'));
    expect((await onboardingRepository.getState()).completed).toBe(false);
  });

  it('게스트 신체정보 승격: 서버 빈 칸만 채우고 온보딩은 건너뛴다', async () => {
    await onboardingRepository.saveProfile({ heightCm: 175, weightKg: 65, gender: 'male' });
    await onboardingRepository.markCompleted();
    mockGet.mockResolvedValue({ nickname: '달여' });
    mockUpdate.mockResolvedValue({ nickname: '달여', heightCm: 175, weightKg: 65, gender: 'male' });
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });

    renderAt('/main');

    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith({ heightCm: 175, weightKg: 65, gender: 'male' }),
    );
    await new Promise((r) => setTimeout(r, 0));
    expect(at()).toBe('/main');
  });

  it('서버에 이미 있는 필드는 덮어쓰지 않는다', async () => {
    await onboardingRepository.saveProfile({ heightCm: 175, weightKg: 65, gender: 'male' });
    mockGet.mockResolvedValue({ nickname: '달여', heightCm: 180, gender: 'female' });
    mockUpdate.mockResolvedValue({ nickname: '달여', heightCm: 180, weightKg: 65 });
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    renderAt('/main');
    await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith({ weightKg: 65 }));
  });

  it('서버 조회 실패 → 플래그를 건드리지 않고 이동도 하지 않는다', async () => {
    await onboardingRepository.markCompleted();
    mockGet.mockRejectedValue(new Error('network'));
    useSessionStore.setState({ status: 'authenticated', session: { userId: 'u' } });
    renderAt('/main');
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 0));
    expect(at()).toBe('/main');
    expect((await onboardingRepository.getState()).completed).toBe(true);
  });

  it('온보딩 화면 안에서는 재이동하지 않는다', async () => {
    useSessionStore.setState({ status: 'unauthenticated', session: null });
    renderAt('/onboarding');
    await new Promise((r) => setTimeout(r, 0));
    expect(at()).toBe('/onboarding');
  });
});
