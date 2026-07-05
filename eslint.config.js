import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', '.claude'] },
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
      // eslint-plugin-react-hooks v7 promotes several new checks to errors in
      // its recommended config. Keep them as warnings for now so the version
      // bump doesn't force a risky refactor of existing effects — the project
      // already lints with `--max-warnings 99999`, so these stay visible
      // without breaking CI. Tracked for a proper follow-up cleanup.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Allow intentionally-unused identifiers when prefixed with `_`
      // (e.g. destructured props stripped from a mock, ignored catch bindings).
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          // Permit destructuring keys out solely to omit them from a `...rest`.
          ignoreRestSiblings: true,
        },
      ],
    },
  },
)
