import { useLoginSheet } from '@/features/login/model/useLoginSheet';

/** 마이페이지 상단 "로그인하세요" 배너 (LOGIN-S3, FR-LOGIN-04). 탭 시 로그인 시트. */
export function LoginBanner() {
  const { open } = useLoginSheet();
  return (
    <button
      type="button"
      data-testid="login-banner"
      onClick={() => open()}
      className="w-full rounded-md bg-primary px-4 py-3 text-left text-primary-contrast"
    >
      로그인하세요
    </button>
  );
}
