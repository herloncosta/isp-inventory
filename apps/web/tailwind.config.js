/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Archivo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Azeret Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        paper: 'var(--paper)',
        ink: 'var(--ink)',
        'ink-70': 'var(--ink-70)',
        'ink-45': 'var(--ink-45)',
        carbon: 'var(--carbon)',
        'carbon-deep': 'var(--carbon-deep)',
        'carbon-wash': 'var(--carbon-wash)',
        'carbon-edge': 'var(--carbon-edge)',
        'red-carbon': 'var(--red-carbon)',
        'papel-levantado': 'var(--papel-levantado)',
        'linha-marcada': 'var(--linha-marcada)',
        rule: 'var(--rule)',
        'rule-strong': 'var(--rule-strong)',
      },
      borderRadius: {
        form: '2px',
      },
    },
  },
  plugins: [],
};
