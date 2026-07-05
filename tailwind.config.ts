import type { Config } from 'tailwindcss';

// Lo-Fi First: 모든 시각 값은 CSS 변수(tokens.css) 참조. 실제 디자인은 토큰만 수정.
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-subtle': 'var(--color-surface-subtle)',
        border: 'var(--color-border)',
        text: 'var(--color-text)',
        'text-strong': 'var(--color-text-strong)',
        muted: 'var(--color-text-muted)',
        subtle: 'var(--color-text-subtle)',
        primary: 'var(--color-primary)',
        'primary-weak': 'var(--color-primary-weak)',
        'primary-contrast': 'var(--color-primary-contrast)',
        disabled: 'var(--color-disabled)',
        danger: 'var(--color-danger)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        rounded: 'var(--font-rounded)',
      },
      // Figma 텍스트 스타일 1:1 매핑 (SF_{weight}_{size}). 크기+행간+굵기 일괄 적용.
      // 예) text-r-14 = SF_R_14. SF_Rounded_L_12 는 font-rounded 와 함께 사용.
      fontSize: {
        'rounded-l-12': ['12px', { lineHeight: '14px', fontWeight: '300' }],
        'l-12': ['12px', { lineHeight: '14px', fontWeight: '300' }],
        'r-14': ['14px', { lineHeight: '16px', fontWeight: '400' }],
        'm-10': ['10px', { lineHeight: '12px', fontWeight: '500' }],
        'm-12': ['12px', { lineHeight: '14px', fontWeight: '500' }],
        'm-14': ['14px', { lineHeight: '16px', fontWeight: '500' }],
        'm-15': ['15px', { lineHeight: '18px', fontWeight: '500' }],
        'sb-15': ['15px', { lineHeight: '20px', fontWeight: '600' }],
        'sb-20': ['20px', { lineHeight: '22px', fontWeight: '600' }],
        'b-22': ['22px', { lineHeight: '26px', fontWeight: '700' }],
        // 완주결과 거리 숫자 등 대형 표시용(로파이 임시치 — 디자이너 수치로 교체 예정)
        'b-34': ['34px', { lineHeight: '40px', fontWeight: '700' }],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
};

export default config;
