---
paths: src/components/ui/**/*.{ts,tsx}
---

# UI Component 規約

## 責務
- 再利用可能な最小単位のUIコンポーネント
- **他のコンポーネントに依存しない**
- アプリケーション固有のロジックを含まない

## 実装規約

### props は必須引数のみ
オプショナル引数やデフォルト値は禁止。必要な値はすべて明示的に渡す。

```typescript
// ✅ Good
type ButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  variant: 'primary' | 'secondary';
};

// ❌ Bad
type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
};
```

### TsDoc コメント必須
関数やコンポーネントにはTsDocコメントを必ず追加する。初めて見た人でも使い方や入力・出力がわかる例を掲載し、説明を一切省略せず具体的に記載する。

```typescript
/**
 * ボタンコンポーネント
 *
 * @param {Object} props - プロパティ
 * @param {React.ReactNode} props.children - ボタンのテキスト
 * @param {() => void} props.onClick - クリック時の処理
 * @param {'primary' | 'secondary'} props.variant - ボタンのスタイル
 */
export function Button({ children, onClick, variant }: ButtonProps) {
  // ...
}
```

### Server Components を優先
デフォルトは Server Components として実装する。以下の場合のみ Client Components を使用:
- イベントハンドラーが必要 (`onClick`, `onChange`)
- React Hooksが必要 (`useState`, `useEffect`)
- ブラウザAPIが必要 (`localStorage`, `window`)

### スタイリング
- Tailwind CSS のユーティリティクラスを使用
- `cn()` ユーティリティで条件付きクラス名を管理
- CSS Modules は使用しない
