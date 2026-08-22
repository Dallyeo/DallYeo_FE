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
        'primary-subtle': 'var(--color-primary-subtle)',
        'primary-contrast': 'var(--color-primary-contrast)',
        disabled: 'var(--color-disabled)',
        danger: 'var(--color-danger)',
        dim: 'var(--color-dim)', // 모달 딤 — `bg-black/40`은 팔레트 var 때문에 동작하지 않음
        kakao: 'var(--color-kakao)',
        'kakao-contrast': 'var(--color-kakao-contrast)',
        apple: 'var(--color-apple)',
        'apple-contrast': 'var(--color-apple-contrast)',

        // ── 팔레트 직접 참조용 (tokens.css --c-* 매핑) ──
        // 편의를 위해 원시 색을 클래스로 노출: text-gray-700, bg-green-200 등.
        // 단, 재스타일 유연성은 의미 토큰(text-muted 등)이 더 좋음 — 가급적 의미 토큰 우선.
        black: 'var(--c-black)',
        white: 'var(--c-white)',
        'off-white': 'var(--c-off-white)',
        gray: {
          900: 'var(--c-gray-900)',
          700: 'var(--c-gray-700)',
          500: 'var(--c-gray-500)',
          300: 'var(--c-gray-300)',
          250: 'var(--c-gray-250)',
          200: 'var(--c-gray-200)',
          disabled: 'var(--c-gray-disabled)',
        },
        green: {
          700: 'var(--c-green-700)',
          500: 'var(--c-green-500)',
          200: 'var(--c-green-200)',
        },
        red: 'var(--c-red)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        display: 'var(--font-display)',
      },
      // 타입 스케일 — Figma Text styles(font.png) 값을 폰트 비종속 역할 이름으로 정의.
      // [size, { lineHeight, letterSpacing, fontWeight }]. 자간 %→em(예: -2% = -0.02em).
      // 폰트 교체 시 이 이름/스케일은 불변, tokens.css --font-sans 만 교체.
      fontSize: {
        'display-lg': ['40px', { lineHeight: '30px', letterSpacing: '0em', fontWeight: '700' }], // P_B_40
        display: ['30px', { lineHeight: '30px', letterSpacing: '0em', fontWeight: '700' }], // P_B_30
        headline: ['23px', { lineHeight: '35px', letterSpacing: '0em', fontWeight: '600' }], // P_SB_23
        title: ['22px', { lineHeight: '26px', letterSpacing: '0em', fontWeight: '700' }], // P_B_22
        heading: ['20px', { lineHeight: '28px', letterSpacing: '-0.02em', fontWeight: '600' }], // P_SB_20
        subheading: ['17px', { lineHeight: '22px', letterSpacing: '0em', fontWeight: '600' }], // P_SB_17
        label: ['15px', { lineHeight: '20px', letterSpacing: '0em', fontWeight: '600' }], // P_SB_15
        'label-sm': ['13px', { lineHeight: '28px', letterSpacing: '0em', fontWeight: '600' }], // P_SB_13
        body: ['15px', { lineHeight: '20px', letterSpacing: '-0.02em', fontWeight: '500' }], // P_M_15
        'body-sm': ['14px', { lineHeight: '20px', letterSpacing: '-0.02em', fontWeight: '500' }], // P_M_14
        footnote: ['14px', { lineHeight: '16px', letterSpacing: '0em', fontWeight: '400' }], // P_R_14
        caption: ['12px', { lineHeight: '20px', letterSpacing: '-0.02em', fontWeight: '500' }], // P_M_12
        'caption-tight': ['12px', { lineHeight: '14px', letterSpacing: '0em', fontWeight: '500' }], // P_M_12_line
        'caption-light': ['12px', { lineHeight: '14px', letterSpacing: '-0.02em', fontWeight: '300' }], // P_L_12
        overline: ['10px', { lineHeight: '12px', letterSpacing: '0.04em', fontWeight: '500' }], // P_M_10
        'overline-strong': ['10px', { lineHeight: '12px', letterSpacing: '-0.02em', fontWeight: '600' }], // P_SB_10
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
