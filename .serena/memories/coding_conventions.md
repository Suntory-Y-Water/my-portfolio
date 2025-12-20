# コーディング規約

## TypeScript規約

### 型定義
- **Interface禁止、type使用**: `interface` ではなく `type` を使用する
- **any禁止**: `noExplicitAny`, `noImplicitAnyLet`, `noEvolvingTypes` すべてエラー
- **配列型**: 一貫した配列型定義を強制
- **型パラメータ**: 一貫性を保つ

### 関数
- **引数2個以上はオブジェクト形式**: カスタムBiomeプラグイン (`biome-plugins/max-function-params.grit`) で強制
- **パラメータ再代入禁止**: `noParameterAssign` エラー

### 制御構文
- **ifブロック強制**: `useBlockStatements` エラー (ブレース省略禁止)
- **不要な条件禁止**: `noUnnecessaryConditions` エラー

### モジュール
- **verbatimModuleSyntax**: `tsconfig.json` で有効
- **import自動整理**: Biomeのassist機能で自動化

## フォーマット規約

### JavaScript/TypeScript
- **インデント**: スペース2個
- **行幅**: 80文字
- **クォート**: シングルクォート (`'`)
- **JSXクォート**: シングルクォート (`'`)
- **セミコロン**: 必須
- **末尾カンマ**: すべて付与

### パスエイリアス
- `@/*` → `./src/*`

### ファイル構成
```
src/
├── components/   # Reactコンポーネント
├── config/       # 設定ファイル (site.ts, tag-slugs.ts等)
├── constants/    # 定数定義
├── layouts/      # Astroレイアウト
├── lib/          # ユーティリティ関数
├── pages/        # Astroページ
├── styles/       # グローバルスタイル
└── types/        # 型定義
```

## コミット規約
- SVGファイル: セキュリティチェック必須
- ブログMarkdown: タグチェック、アイコン変換、textlint自動実行
- pre-commit hook: `.husky/pre-commit` で自動検証・修正
