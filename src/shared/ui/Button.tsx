import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

/** 토큰 기반 Lo-Fi 버튼 골격 (NFR-UI-01). */
export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = 'rounded-md px-4 py-2 text-base disabled:opacity-40 disabled:pointer-events-none';
  const styles =
    variant === 'primary'
      ? 'bg-primary text-primary-contrast'
      : 'border border-border bg-surface text-text';
  return <button type="button" className={`${base} ${styles} ${className}`} {...props} />;
}
