import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { NearbyPlace, RunResult } from '@/domain/types';
import { useSessionStore } from '@/shared/auth/sessionStore';
import { useLoginSheetStore } from '@/features/login/model/loginSheetStore';
import { bridgeService } from '@/shared/services/BridgeService';
import { runRepository } from '@/features/runResult/api/runRepository';
import { useRunResultStore } from './runResultStore';

/**
 * 완주 결과 뷰 모델 (D3/D4).
 *
 * ⚠️ 2026-09-14 — **웹은 더 이상 기록을 저장하지 않는다.** `POST /runs`(multipart + 경로 이미지)는
 * 네이티브가 완주 직후에 수행하고, 비로그인이라 실패하면 네이티브가 로컬에 들고 있다가
 * 로그인 후 재시도한다. 웹에 남는 책임은 두 가지뿐이다:
 *   1) 네이티브가 준 runId로 `GET /runs/{id}` 결과를 받아 그린다,
 *   2) 비로그인으로 결과창을 떠날 때 "로그인하면 저장된다"는 안내 팝업을 띄운다(FR-V10).
 */
export function useRunResult() {
  const navigate = useNavigate();
  const payload = useRunResultStore((s) => s.payload);
  const status = useSessionStore((s) => s.status);
  const openLoginSheet = useLoginSheetStore((s) => s.open);

  const [confirmOpen, setConfirmOpen] = useState(false);

  // 결과 본문은 백엔드가 원천이다 — 네이티브가 저장을 마친 뒤에 이벤트를 주므로 id는 이미 유효하다.
  // 비로그인이면 애초에 저장이 없어 401이 난다 → AsyncBoundary가 에러 상태로 잡는다.
  const stamps = payload?.newAchievements;
  const resultQuery = useQuery<RunResult>({
    queryKey: ['runResult', payload?.runId],
    queryFn: () => runRepository.getResult(payload!.runId),
    enabled: !!payload?.runId && status === 'authenticated',
    // 완주 직후 한 번 받으면 끝 — 화면을 오가며 같은 기록을 다시 받을 이유가 없다
    staleTime: Infinity,
    /*
     * 도장은 **조회 응답에 없다** — `POST /runs` 응답에만 실린다(§7.4 명시).
     * 저장한 주체가 네이티브라 배열을 본 것도 네이티브뿐이고, 이벤트로 넘어온 값이 유일한 출처다.
     * 그래서 조회 결과에 덧입힌다(네이티브가 아직 안 보내면 조회 응답의 값을 그대로 둔다).
     */
    select: (data) => (stamps?.length ? { ...data, newAchievements: stamps } : data),
  });

  /** '메인화면' 버튼: 로그인 상태면 바로 이동, 비로그인이면 저장 안내 팝업 */
  const leaveToMain = useCallback((): void => {
    if (status === 'authenticated') {
      navigate('/main');
      return;
    }
    setConfirmOpen(true);
  }, [status, navigate]);

  /**
   * 팝업 '로그인': 로그인 시트 오픈.
   * 로그인이 끝나면 **네이티브가** 보관해 둔 기록을 백엔드로 재전송한다(웹은 저장하지 않는다).
   */
  const confirmLogin = useCallback((): void => {
    setConfirmOpen(false);
    openLoginSheet('saveRunResult');
  }, [openLoginSheet]);

  /** 팝업 '저장 안 함': 저장 없이 메인 이동 */
  const leaveWithoutSave = useCallback((): void => {
    setConfirmOpen(false);
    navigate('/main');
  }, [navigate]);

  const closeConfirm = useCallback((): void => setConfirmOpen(false), []);

  /** 주변 장소 → 외부 지도 열기 */
  const openPlace = useCallback((place: NearbyPlace): void => {
    bridgeService.openExternalUrl(place.externalMapUrl);
  }, []);

  return {
    payload,
    resultQuery,
    confirmOpen,
    leaveToMain,
    confirmLogin,
    leaveWithoutSave,
    closeConfirm,
    openPlace,
  };
}
