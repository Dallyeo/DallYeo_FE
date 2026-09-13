import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { NearbyPlace } from '@/domain/types';
import { useSessionStore } from '@/shared/auth/sessionStore';
import { useLoginSheetStore } from '@/features/login/model/loginSheetStore';
import { bridgeService } from '@/shared/services/BridgeService';
import { logger } from '@/shared/observability/logger';
import { toast } from '@/shared/ui/toastStore';
import { runRepository } from '@/features/runResult/api/runRepository';
import { useRunResultStore } from './runResultStore';

/**
 * 완주 결과 뷰 모델 (D3/D4). 저장 게이팅 + 공유/링크복사/외부지도.
 * - 로그인 상태 + 미저장 → 진입 시 자동 저장 1회.
 * - 비로그인 → '메인화면' 이탈 시 확인 팝업 → 로그인 시 저장(자동 effect), 취소 시 저장 없이 이동.
 */
export function useRunResult() {
  const navigate = useNavigate();
  const result = useRunResultStore((s) => s.result);
  const saved = useRunResultStore((s) => s.saved);
  const markSaved = useRunResultStore((s) => s.markSaved);
  const status = useSessionStore((s) => s.status);
  const openLoginSheet = useLoginSheetStore((s) => s.open);

  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const save = useCallback(async (): Promise<void> => {
    const current = useRunResultStore.getState();
    if (!current.result || current.saved) return;
    setSaving(true);
    try {
      await runRepository.saveResult(current.result);
      markSaved();
    } catch (e) {
      logger.error('run_save_failed', { message: (e as Error)?.message });
      toast.show('기록 저장에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  }, [markSaved]);

  // 로그인 상태 + 미저장 → 자동 저장 (비로그인 로그인 성공 시에도 이 effect가 재개)
  useEffect(() => {
    if (result && status === 'authenticated' && !saved) {
      void save();
    }
  }, [result, status, saved, save]);

  /** '메인화면' 버튼: 로그인 상태면 바로 이동, 비로그인이면 저장 안내 팝업 */
  const leaveToMain = useCallback((): void => {
    if (status === 'authenticated') {
      navigate('/main');
      return;
    }
    setConfirmOpen(true);
  }, [status, navigate]);

  /** 팝업 '로그인': 로그인 시트 오픈(성공 시 자동저장 effect가 저장). */
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

  /*
   * 공유/링크복사는 **티켓 이미지 기준**으로 바뀌어 뷰의 `useCaptureShare`가 담당한다.
   * 이전 구현은 `https://dallyeo.app/runs/{id}` 링크를 공유했지만 앱은 로컬 번들이고
   * 라우터에 `/runs/:id`가 없어 받는 사람에게는 죽은 링크였다.
   */

  /** 주변 장소 → 외부 지도 열기 */
  const openPlace = useCallback((place: NearbyPlace): void => {
    bridgeService.openExternalUrl(place.externalMapUrl);
  }, []);

  return {
    result,
    saved,
    saving,
    confirmOpen,
    leaveToMain,
    confirmLogin,
    leaveWithoutSave,
    closeConfirm,
    openPlace,
  };
}
