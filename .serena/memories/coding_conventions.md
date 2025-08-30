# コーディング規約

## TypeScript規約

### 型定義
- `interface` ではなく `type` を使用
- 配列型は `T[]` 形式を使用（`Array<T>` ではない）
- 既存の型定義を活用（`Pick`、`Omit` など）

### 関数定義
- Function宣言を使用（アロー関数ではなく）
- 引数が2個以上の場合はオブジェクト形式で渡す
- 関数ベースの実装（クラスは使用しない）

### 契約による設計
- 関数名と型定義で契約を表現
- TypeScriptで型保証されている条件の重複チェック禁止
- 必要最小限のJSDocコメント

## ESLint設定（eslint.config.mjs）

### React関連
- React Hooks規約準拠
- `react/prop-types` は無効（TypeScriptで型保証）
- JSX要素は`<img>`ではなく`<Image>`を使用

### TypeScript関連  
- 未使用変数は警告レベル
- `_` プレフィックスの引数は無視
- 明示的な戻り値型は不要

### Import順序規約
1. React、React DOM関連
2. Next.js関連
3. 外部ライブラリ
4. 内部ライブラリ（パス別）
   - `@/types/**`
   - `@/config/**`
   - `@/lib/**`
   - `@/hooks/**`
   - `@/components/shadcn-ui/**`
   - `@/components/**`
   - `@/**`
5. Type imports

### コードスタイル
- 未使用importの自動削除
- Import重複禁止
- アルファベット順ソート

## Prettier設定（prettier.config.mjs）
- Print width: 80
- Tab width: 2
- セミコロン: 必須
- シングルクォート使用
- JSXでもシングルクォート使用
- 末尾カンマ: ES5準拠
- Tailwind CSSプラグイン有効

## プロジェクト固有のルール

### パス構成
- パスエイリアス: `@/*` → `./src/*`
- 絶対パスでのimportを推奨

### コンポーネント構成
- `src/components/ui/`: 汎用UIコンポーネント（shadcn/ui）
- `src/components/feature/`: 機能固有コンポーネント
- `src/components/shared/`: 共通コンポーネント
- `src/components/icons/`: アイコンコンポーネント