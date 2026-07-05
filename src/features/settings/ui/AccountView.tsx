import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SafeAreaLayout } from '@/app/SafeAreaLayout';
import { Button } from '@/shared/ui';
import { toast } from '@/shared/ui/toastStore';
import { useAuth } from '@/features/login/model/useAuth';

/**
 * V13 계정관리 (lo-fi 스켈레톤). 로그아웃(브릿지) + 계정 삭제(준비 중 placeholder).
 * 계정 삭제는 파괴적 작업 — 실제 연동은 백엔드/기획 확정 후.
 */
export function AccountView() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout(): Promise<void> {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/main');
    } catch {
      toast.show('로그아웃에 실패했어요.');
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <SafeAreaLayout>
      <header className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          data-testid="account-back"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="text-sb-20 text-text-strong"
        >
          ‹
        </button>
        <h1 className="flex-1 text-center text-m-15 text-text-strong">계정관리</h1>
        <span className="w-5" aria-hidden />
      </header>

      <main data-testid="account-view" className="flex flex-1 flex-col gap-3 p-5">
        <Button
          variant="secondary"
          className="h-14 rounded-2xl"
          data-testid="account-logout"
          disabled={loggingOut}
          onClick={handleLogout}
        >
          로그아웃
        </Button>
        <Button
          variant="secondary"
          className="h-14 rounded-2xl text-danger"
          data-testid="account-delete"
          onClick={() => toast.show('계정 삭제는 준비 중이에요.')}
        >
          계정 삭제
        </Button>
      </main>
    </SafeAreaLayout>
  );
}
