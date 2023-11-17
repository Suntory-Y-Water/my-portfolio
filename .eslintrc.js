module.exports = {
  extends: [
    'next', // Next.jsの推奨設定
    'next/core-web-vitals', // パフォーマンスとWeb Vitalsに焦点を当てたNext.jsの設定
    'eslint:recommended', // ESLintの基本的な推奨ルール
    'plugin:@typescript-eslint/recommended', // TypeScript用の推奨ルール
    'plugin:react/recommended', // Reactの推奨ルール
    'plugin:react-hooks/recommended', // React Hooksのベストプラクティスに準拠
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
    'react/react-in-jsx-scope': 'off', // React 17+では不要なため無効化
    'react/prop-types': 'off', // TypeScriptを使用しているためprop-typesは不要
    '@typescript-eslint/explicit-module-boundary-types': 'off', // すべての関数で明示的な戻り値の型を要求しない
    'no-console': 'warn', // コンソールログの使用に警告
    eqeqeq: ['error', 'always'], // 厳密等価演算子の使用を強制
    // その他のルールはプロジェクトのニーズに応じて追加
  },
  settings: {
    react: {
      version: 'detect', // Reactのバージョンを自動で検出
    },
  },
};
