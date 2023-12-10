module.exports = {
  extends: [
    'next', // Next.jsの推奨設定
    'next/core-web-vitals', // パフォーマンスとWeb Vitalsに焦点を当てたNext.jsの設定
    'eslint:recommended', // ESLintの基本的な推奨ルール
    'plugin:@typescript-eslint/recommended', // TypeScript用の推奨ルール
    'plugin:react/recommended', // Reactの推奨ルール
    'plugin:react-hooks/recommended', // React Hooksのベストプラクティスに準拠,
    'airbnb',
  ],
  plugins: [
    'react', // Reactプラグインを使用
    '@typescript-eslint', // TypeScriptの構文解析とルールを適用
    'react-hooks', // React Hooksのカスタムルールを適用
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 2020, // ECMAScript 2020をサポート
    sourceType: 'module', // モジュール構文を使用
    ecmaFeatures: {
      jsx: true, // JSXをサポート
    },
  },
  rules: {
    'react/jsx-filename-extension': ['off'],
    'import/extensions': ['off'],
    'jsx-quotes': ['off'],
    'linebreak-style': ['off'],
    'import/prefer-default-export': 'off',
    'operator-linebreak': ['off'],
  },
  overrides: [
    {
      files: ['app/api/**/*.ts'],
      rules: {
        'import/prefer-default-export': 'off',
      },
    },
  ],
  settings: {
    react: {
      version: 'detect', // Reactのバージョンを自動で検出
    },
  },
};
