# 新規図解コンポーネント提案 - 3つの候補

## 調査結果サマリー

### 既存コンポーネント（10種類）
1. hero - 記事タイトル表示
2. problem - 問題カード表示
3. core_message - 核心メッセージと比較
4. steps - 番号付き手順
5. action - CTA
6. transition - 区切り
7. score_comparison - 数値比較
8. list_steps - バッジ付きリスト
9. flow_chart - 左→右の矢印フロー
10. grouped_content - 階層構造

### 記事分析結果（2025年6月〜12月、21記事）

**最も頻出するが既存では不十分なパターン**:
1. **コード差分・変更系**（13記事）- Before/After、API変更、実装修正
2. **数値インパクト系**（8記事）- バンドルサイズ削減、トークン削減、パフォーマンス改善
3. **時系列イベント系**（6記事）- 攻撃シナリオ、インシデント経緯、移行タイムライン

---

## 提案1: `code_diff` (コード差分比較)

### 目的
API変更、コード修正の「Before/After」を並列表示。読者が一目で「何が変わったか」を理解できる。

### 具体的な使用例

**2025-06-08 Illegal invocation記事のコード修正**:
```typescript
// Before（エラー発生）
const client = new Client({
  auth: apiKey
});

// After（解決）
const client = new Client({
  auth: apiKey,
  fetch: fetch.bind(globalThis)  // ← この1行で解決
});
```

**2025-06-29 Hydration Issue記事のコード修正**:
```typescript
// Before（SSR同期問題）
<select name='sort' value={currentSort} onChange={handleChange}>

// After（解決）
<select name='sort' defaultValue={currentSort} onChange={handleChange}>
// + useEffect で明示的同期
```

**2025-11-23 SVGちらつき修正記事**:
```tsx
// Before（Image コンポーネント、ちらつきあり）
<Image src={displayUrl} alt={...} width={80} height={80} />

// After（インライン SVG、ちらつきなし）
<span dangerouslySetInnerHTML={{ __html: inlineSvg }} />
```

### 既存との差別化
- `core_message`: テキストベースの比較、コード表示に不向き
- `score_comparison`: 数値比較特化、コードブロック非対応
- **差別化ポイント**: 2カラム並列表示 + コード特化 + 差分行ハイライト

### UI/UX設計
```
┌──────────────────────────────────────────────────────┐
│  💻 Cloudflare Workers での fetch コンテキスト修正    │
│  thisコンテキストの喪失を防ぐため...                 │
├──────────────────────────────────────────────────────┤
│  ┌───────────────────────┐ ┌───────────────────────┐│
│  │ ❌ 修正前（エラー発生）│ │ ✅ 修正後（正常動作）││
│  ├───────────────────────┤ ├───────────────────────┤│
│  │ const client = new   │ │ const client = new   ││
│  │   Client({           │ │   Client({           ││
│  │     auth: apiKey     │ │     auth: apiKey,    ││
│  │   });                │ │ ✨ fetch: fetch...  │←強調│
│  │                      │ │   });                ││
│  └───────────────────────┘ └───────────────────────┘│
└──────────────────────────────────────────────────────┘

※モバイル時は縦積みレイアウトに切り替え
```

### YAML Schema
```yaml
- type: code_diff
  title: "Cloudflare Workers での fetch コンテキスト修正"
  introText: "thisコンテキストの喪失を防ぐため、fetchを明示的にバインドします。"
  icon: code2  # オプション
  language: typescript  # 言語ラベル表示用

  before:
    label: "修正前（エラー発生）"
    code: |
      const client = new Client({
        auth: apiKey
      });
    highlightLines: []  # オプション

  after:
    label: "修正後（正常動作）"
    code: |
      const client = new Client({
        auth: apiKey,
        fetch: fetch.bind(globalThis)
      });
    highlightLines: [3]  # 3行目を強調

  summary: "fetch.bind(globalThis)を追加することで解決"  # オプション
  accentColor: GOLD  # オプション
```

### アニメーション仕様
- ホバー時に差分行がわずかに拡大（scale: 1.02）
- 追加行は緑系アクセント、削除行は赤系アクセント

---

## 提案2: `metrics_impact` (数値インパクト表示)

### 目的
技術的改善の「数値インパクト」を視覚的に強調。読者の注目を引き、成果を印象付ける。

### 具体的な使用例

**2025-12-20 Astro移行記事のバンドルサイズ削減**:
```
markdown-content.js: -138.67 kB (gzip)
Mermaid関連チャンク全体: -500+ kB
総モジュール数: -1751 modules
```

**2025-11-09 MCP検証記事のトークン削減**:
```
トークン消費: 150,000 → 2,000 (98.7%削減)
```

**2025-11-22 Pagefind記事のパフォーマンス**:
```
検索対象: 90+ページ
検索速度: 爆速（ミリ秒単位）
```

### 既存との差別化
- `score_comparison`: 2つの対象を比較する設計、単独成果の強調には不向き
- `core_message`: テキスト主体、数値の視覚的インパクトが弱い
- **差別化ポイント**: 大きなタイポグラフィ + カウントアップアニメーション + 複数メトリクス並列

### UI/UX設計
```
┌────────────────────────────────────────────────────────┐
│  📊 Astro移行による劇的なパフォーマンス改善            │
│  Mermaid.jsをビルド時SVG化することで...               │
├────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │     ✨       │ │              │ │      ✨      │  │
│  │   -500KB    │ │   -1751     │ │    2.7KB    │  │
│  │  ↑大きい数字 │ │   モジュール │ │  最終サイズ  │  │
│  │             │ │              │ │             │  │
│  │ バンドル削減 │ │  総モジュール │ │ content.js  │  │
│  │ Mermaid関連 │ │   数削減     │ │   (gzip)    │  │
│  └──────────────┘ └──────────────┘ └──────────────┘  │
│                 ↑ ポジティブ=緑系 / ネガティブ=赤系     │
└────────────────────────────────────────────────────────┘

※モバイル時は縦積みレイアウトに切り替え
```

### YAML Schema
```yaml
- type: metrics_impact
  title: "Astro移行による劇的なパフォーマンス改善"
  introText: "Mermaid.jsをビルド時SVG化することで、JavaScriptバンドルを大幅に削減しました。"
  icon: trendingUp  # オプション

  metrics:
    - value: "-500KB"
      label: "バンドルサイズ削減"
      description: "Mermaid関連チャンク全体"
      trend: positive  # positive | negative | neutral
      accentColor: GOLD  # オプション

    - value: "-1751"
      label: "モジュール数削減"
      description: "ビルド時の総モジュール数"
      trend: positive

    - value: "2.7KB"
      label: "markdown-content.js"
      description: "修正後のファイルサイズ (gzip)"
      trend: positive
      accentColor: GOLD

  layout: horizontal  # horizontal | vertical
```

### アニメーション仕様
- Intersection Observer でビューポート内に入った時にトリガー
- 数値がカウントアップ/ダウンするアニメーション（duration: 1.5s）
- 完了時にわずかなバウンスエフェクト

---

## 提案3: `timeline_events` (時系列イベント)

### 目的
セキュリティインシデント、技術対応の経緯など「時間軸での理解」を視覚化。ストーリーとして理解させる。

### 具体的な使用例

**2025-11-17 GitHub Actions セキュリティ記事の攻撃シナリオ**:
```
2025/08/26 午前   - Claude Codeが脆弱性コード生成
         数時間後 - 攻撃者がGITHUB_TOKEN盗取 ★重要
         約2時間  - 悪意あるバージョン公開、900人被害 ★重要
         同日中   - コミュニティ検知、パッケージ取り下げ
```

**2025-12-25 Renovate記事のクールダウン概念**:
```
Day 0 - 新バージョン公開
Day 1 - コミュニティが検証中（待機）
Day 2 - 問題発見時は取り下げられる
Day 3 - 安全確認済み → 自動更新対象に
```

**2025-12-20 Astro移行記事の意思決定経緯**:
```
12/10頃 - React Server Components脆弱性発覚
12/12   - 追加の脆弱性発見
12/20   - Next.js → Astro移行完了
```

### 既存との差別化
- `steps`: 時間軸の概念が弱い、単なる順序のみ
- `flow_chart`: 左→右の水平フロー、時刻情報なし、イベント強調なし
- **差別化ポイント**: 縦方向タイムライン + 時刻/相対時間表示 + 重要イベント強調

### UI/UX設計
```
┌────────────────────────────────────────────────────┐
│  🔍 Nx サプライチェーン攻撃の経緯                   │
│  2025年8月26日に発生した攻撃の時系列を追います。    │
├────────────────────────────────────────────────────┤
│                                                    │
│    ●─────────────────────────────                 │
│    │ 8/26 午前                                    │
│    │ 脆弱性を含むPRがマージ                       │
│    │ Script Injectionを含むワークフローが...       │
│    ↓                                              │
│    ●─────────────────────────────                 │
│    │ 数時間後                                     │
│    │ 攻撃者がGITHUB_TOKENを窃取                   │
│    │ pull_request_targetで権限昇格を...          │
│    ↓                                              │
│    ◆─────────────────────────────  ★重要（赤強調）│
│    │ 約2時間                                      │
│    │ 悪意あるバージョンが公開                     │
│    │ postinstallスクリプトで秘密情報を...         │
│    ↓                                              │
│    ◆─────────────────────────────  ★重要（金強調）│
│    │ 同日中                                       │
│    │ コミュニティが検知・通報                     │
│    │ 不正パッケージが取り下げられ...              │
│    ↓                                              │
│    ◇─────────────────────────────  終端           │
│                                                    │
└────────────────────────────────────────────────────┘

※モバイルでは片側配置に切り替え
```

### YAML Schema
```yaml
- type: timeline_events
  title: "Nx サプライチェーン攻撃の経緯"
  introText: "2025年8月26日に発生した攻撃の時系列を追います。"
  icon: clock  # オプション

  events:
    - time: "8/26 午前"
      title: "脆弱性を含むPRがマージ"
      description: "Script Injectionを含むワークフローが本番環境に反映。"
      icon: gitMerge  # オプション
      isHighlight: false

    - time: "数時間後"
      title: "攻撃者がGITHUB_TOKENを窃取"
      description: "pull_request_targetトリガーを悪用し、権限昇格に成功。"
      icon: alertTriangle
      isHighlight: true
      accentColor: RED

    - time: "約2時間"
      title: "悪意あるバージョンが公開"
      description: "postinstallスクリプトで秘密情報を収集。900人以上が被害。"
      icon: alertCircle
      isHighlight: true
      accentColor: RED

    - time: "同日中"
      title: "コミュニティが検知・通報"
      description: "不正パッケージが取り下げられ、セキュリティアドバイザリが公開。"
      icon: shieldCheck
      isHighlight: true
      accentColor: GOLD

  orientation: vertical  # vertical のみ（将来的に horizontal も検討）
```

### アニメーション仕様
- スクロールに連動したフェードインアニメーション（各イベントカード）
- 重要イベントはわずかにパルスするエフェクト
- タイムライン線が上から下へ描画されるアニメーション（オプション）

---

## 3つのコンポーネント比較

| コンポーネント | 主な用途 | 頻出度 | 実装難易度 | 優先度 |
|--------------|---------|--------|-----------|--------|
| `code_diff` | コード修正のBefore/After | 13記事 | 低〜中 | **最高** |
| `metrics_impact` | 数値インパクト強調 | 8記事 | 中 | 高 |
| `timeline_events` | 時系列イベント可視化 | 6記事 | 中 | 高 |

### 推奨実装順序
1. `code_diff` - 最も頻出、実装もシンプル
2. `metrics_impact` - 視覚的インパクト大、差別化しやすい
3. `timeline_events` - 縦レイアウト設計が必要だが可読性高い

---

## 実装に必要な主要ファイル

### 新規作成
- `/src/components/feature/diagram/code-diff-section.tsx`
- `/src/components/feature/diagram/metrics-impact-section.tsx`
- `/src/components/feature/diagram/timeline-events-section.tsx`

### 修正が必要
- `/src/content.config.ts` - Zodスキーマ追加（3コンポーネント分）
- `/src/components/feature/diagram/dynamic-page-builder.tsx` - ルーティング追加
- `/src/components/feature/diagram/icon-config.ts` - 新規アイコン追加（必要に応じて）

### ドキュメント（後で手動更新）
- `/docs/designs/diagram-prompt.md` - 新コンポーネントの使い方追加

---

## 技術的な考慮事項

### code_diff
- シンタックスハイライト: 未決定（シンプルなコードブロック or Shiki活用）
- 差分ハイライト: `highlightLines` 配列で指定された行に背景色適用
- レスポンシブ: `md:` ブレークポイントで2カラム → 縦積み切り替え

### metrics_impact
- カウントアップライブラリ: `react-countup` または自前実装
- Intersection Observer: `useInView` フック活用
- 数値パース: 文字列から数値部分を抽出してアニメーション対象に

### timeline_events
- 垂直線描画: CSS `::before` / `::after` 疑似要素
- イベントカード配置: flexbox または grid レイアウト
- レスポンシブ: モバイルでは線を左端に固定、カード右配置

---

## 次のステップ

1. **スキーマ定義**: `/src/content.config.ts` に Zod スキーマ追加
2. **コンポーネント実装**: 提案順に3つのコンポーネントを作成
3. **動作確認**: サンプル記事で表示テスト
4. **ドキュメント更新**: `diagram-prompt.md` に使い方追加
