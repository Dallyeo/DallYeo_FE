import type { AuthProvider } from '@/domain/types';

const LABELS: Record<AuthProvider, string> = {
  kakao: '카카오로 시작하기',
  apple: 'Apple로 시작하기',
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
  return (
    <button
      type="button"
      data-testid={`login-${provider}-button`}
      disabled={disabled}
      onClick={() => onClick(provider)}
      className="w-full rounded-md border border-border bg-surface px-4 py-3 text-base disabled:opacity-40"
    >
      {LABELS[provider]}
    </button>
  );
}
