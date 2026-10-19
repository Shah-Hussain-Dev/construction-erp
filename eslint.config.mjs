import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@next/next/no-img-element': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/incompatible-library': 'off',
      'react-hooks/purity': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    '.next-e2e/**',
    'mocks/**',
    'scripts/**',
    'lib/domain.cjs',
    'public/sw.js',
    'test-results/**',
    'playwright-report/**',
  ]),
]);
