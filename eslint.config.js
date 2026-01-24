import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../i18n', '../../i18n', '../../../i18n'],
              message: 'Use @/ alias for src imports (no relative imports to src/*).'
            },
            {
              group: ['../components/*', '../../components/*', '../../../components/*'],
              message: 'Use @/ alias for src imports (no relative imports to src/*).'
            },
            {
              group: ['../lib/*', '../../lib/*', '../../../lib/*'],
              message: 'Use @/ alias for src imports (no relative imports to src/*).'
            },
            {
              group: ['../contexts/*', '../../contexts/*', '../../../contexts/*'],
              message: 'Use @/ alias for src imports (no relative imports to src/*).'
            },
            {
              group: ['../utils/*', '../../utils/*', '../../../utils/*'],
              message: 'Use @/ alias for src imports (no relative imports to src/*).'
            },
            {
              group: ['../data/*', '../../data/*', '../../../data/*'],
              message: 'Use @/ alias for src imports (no relative imports to src/*).'
            }
          ]
        }
      ]
    },
  }
);
