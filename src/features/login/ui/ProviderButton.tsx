import { useState } from 'react';
import type { AuthProvider } from '@/domain/types';

const LABELS: Record<AuthProvider, string> = {
  kakao: '카카오로 시작하기',
  apple: 'Apple로 시작하기',
};

// 공식 버튼 이미지. public/auth/ 에 파일을 넣으면 자동 사용, 없으면 텍스트 폴백.
const IMAGES: Record<AuthProvider, string> = {
  kakao: '/auth/kakao_login.png',
  apple: '/auth/apple_login.png',
};

export function ProviderButton({
  provider,
  disabled,
  onClick,
}: {
  provider: AuthProvider;
  disabled?: boolean;
  onClick: (provider: AuthProvider) => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <button
      type="button"
      data-testid={`login-${provider}-button`}
      aria-label={LABELS[provider]}
      disabled={disabled}
      onClick={() => onClick(provider)}
      className="w-full disabled:opacity-40"
    >
      {imageFailed ? (
        <span className="block rounded-md border border-border bg-surface px-4 py-3 text-base">
          {LABELS[provider]}
        </span>
      ) : (
        <img
          src={IMAGES[provider]}
          alt={LABELS[provider]}
          onError={() => setImageFailed(true)}
          className="w-full rounded-md"
        />
      )}
    </button>
  );
}
