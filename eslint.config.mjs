import tsParser from '@typescript-eslint/parser'

export default [
  {
    ignores: ["node_modules/**"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
    },
  },
]
