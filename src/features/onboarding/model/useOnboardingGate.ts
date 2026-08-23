import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Gender, UserProfile, UserProfilePatch } from '@/domain/types';
import { useSessionStore } from '@/shared/auth/sessionStore';
import { logger } from '@/shared/observability/logger';
import { profileRepository } from '@/features/settings/api/profileRepository';
import {
  onboardingRepository,
  readOnboardingCompleted,
} from '@/features/onboarding/api/onboardingRepository';

/**
 * 온보딩 진입 판단 단일 지점 (BR-U2-1, BR-U2-5). RootLayout에서 1회 마운트.
 *
 * 판단 근거는 **로그인 여부에 따라 다르다**:
 * - 게스트: localStorage 플래그가 유일한 근거(서버에 물어볼 토큰이 없다)
 * - 회원: **서버가 기준**. 백엔드 §5.1 `onboardingRequired`는 "신체정보(키/체중) 미입력이면
 *   true"인데 브릿지 계약이 이 필드를 전달하지 않으므로 `GET /users/me`에 같은 규칙을 적용한다.
 *
 * 플래그만 보면 양방향으로 틀린다 — 기기를 바꾼 기존 회원은 온보딩을 다시 보고,
 * 게스트로 온보딩을 마친 기기에서 신규 가입하면 온보딩을 건너뛴다.
 *
 * ⚠️ 판단 근거가 확정되기 전에는 이동하지 않는다. 부트스트랩 중(`unknown`)이거나
 * 서버 정합화 전에 로컬 플래그만 보고 튕기면, 서버상 온보딩을 마친 회원이
 * 새 기기에서 온보딩 화면에 갇힌다.
 */
export function useOnboardingGate(): void {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const status = useSessionStore((s) => s.status);
  /** 서버 정합화 완료 여부 — 회원은 이게 끝나야 플래그를 신뢰할 수 있다 */
  const [reconciled, setReconciled] = useState(false);
  const attempted = useRef(false);

  useEffect(() => {
    if (status !== 'authenticated') {
      // 로그아웃 시 다시 열어둔다(다음 로그인에서 재정합화)
      if (status === 'unauthenticated') {
        attempted.current = false;
        setReconciled(false);
      }
      return;
    }
    if (attempted.current) return;
    attempted.current = true;
    void reconcileWithServer().finally(() => setReconciled(true));
  }, [status]);

  useEffect(() => {
    if (status === 'unknown') return; // 세션 부트스트랩 대기
    if (status === 'authenticated' && !reconciled) return; // 서버 답 대기
    if (pathname.startsWith('/onboarding')) return;
    if (readOnboardingCompleted()) return;
    navigate('/onboarding', { replace: true });
  }, [status, reconciled, pathname, navigate]);
}

/** 성별은 백엔드 NONE ↔ 'unspecified' 이므로 "미입력"으로 함께 취급한다 */
function isGenderUnset(g: Gender | undefined): boolean {
  return g === undefined || g === 'unspecified';
}

/** 서버 기준 온보딩 필요 여부 — 백엔드 `onboardingRequired`와 동일 규칙(키/체중 미입력) */
function isOnboardingRequired(profile: UserProfile): boolean {
  return profile.heightCm === undefined && profile.weightKg === undefined;
}

/**
 * 서버 프로필로 로컬 플래그를 맞춘다. 겸해서 게스트가 입력해둔 신체정보를 승격한다 —
 * 비로그인 온보딩은 토큰이 없어 localStorage에만 저장되고(useOnboarding.syncToServer),
 * 로그인해도 서버로 올라가는 경로가 없어 "설정 > 내정보 수정"이 계속 비어 보였다.
 *
 * 서버 조회가 실패하면 **플래그를 건드리지 않는다** — 네트워크 오류로 기존 회원을
 * 온보딩에 가두거나, 반대로 미완료 회원을 통과시키지 않기 위해 기존 상태를 유지한다.
 */
async function reconcileWithServer(): Promise<void> {
  try {
    const { profile: local } = await onboardingRepository.getState();
    let server = await profileRepository.get();

    // 1) 게스트가 입력해둔 값으로 서버의 빈 칸만 채운다(기존 계정 값은 덮어쓰지 않는다)
    if (local) {
      const patch: UserProfilePatch = {
        ...(server.heightCm === undefined && local.heightCm !== undefined
          ? { heightCm: local.heightCm }
          : {}),
        ...(server.weightKg === undefined && local.weightKg !== undefined
          ? { weightKg: local.weightKg }
          : {}),
        ...(isGenderUnset(server.gender) && !isGenderUnset(local.gender) && local.gender
          ? { gender: local.gender }
          : {}),
      };
      if (Object.keys(patch).length > 0) {
        server = await profileRepository.update(patch);
        logger.info('onboarding.guestProfilePromoted', { fields: Object.keys(patch) });
      }
    }

    // 2) 승격 후에도 신체정보가 없으면 온보딩이 필요한 계정이다
    if (isOnboardingRequired(server)) {
      await onboardingRepository.reset();
      return;
    }

    // 3) 서버가 "완료"라고 하면 이 기기의 플래그도 맞춘다(기기 교체 시 재온보딩 방지)
    await onboardingRepository.markCompleted();
  } catch (e) {
    logger.error('[onboarding] 서버 온보딩 상태 정합화 실패', { cause: String(e) });
  }
}
