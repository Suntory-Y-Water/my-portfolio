# ブログ一覧→詳細ページ View Transition 仕様

## 対象リポジトリ

https://github.com/azukiazusa1/sapper-blog-app

## 目的
- ブログ一覧から個別記事へ遷移する際に「画面が移動する」ような一貫したアニメーションを提供し、視覚的な文脈を保ったままユーザーを詳細ページに誘導する。
- ブラウザ標準の View Transition API を活用し、JavaScript 依存を最小に抑えた保守しやすい実装を維持する。
- `prefers-reduced-motion` 等のアクセシビリティ設定を尊重しつつ、将来的な拡張（別ページ種別への適用）が容易な構成にする。

## 概要
| 項目 | 内容 |
| --- | --- |
| 遷移トリガー | SvelteKit の `onNavigate` フックでルーター遷移開始時に `document.startViewTransition()` を呼び出す（`app/src/routes/+layout.svelte`）。 |
| マッチング手法 | 遷移元・先の対応要素に CSS カスタムプロパティ `--tag` を埋め込み、`view-transition-name: var(--tag)` で同名要素を結び付ける（`app/src/app.css`）。 |
| 対応要素 | 記事タイトル、概要、公開日時、タグ、サムネイル画像など、一覧と詳細の双方に存在し「同じ意味」を持つ要素すべて。 |
| フォールバック | `document.startViewTransition` 未対応ブラウザでは通常遷移。`prefers-reduced-motion: reduce` では CSS メディアクエリにより View Transition を自動無効化。 |
| 周辺機能 | `NProgress` によるロードインジケータを併用し、アニメーションと進捗表示が競合しないようにしている。 |

## 技術詳細

### 1. ルーティング層でのトランジション開始
- `app/src/routes/+layout.svelte` で `onNavigate` を登録し、`document.startViewTransition(async () => { await navigation.complete; })` で DOM 差し替えの直前・直後をブラウザに通知する。
- `navigation.complete` を待ってから Promise を解決することで、新旧 DOM が両方そろった状態でアニメーションが走り、途中でキャンセルしても表示が破綻しない。
- ブラウザサポートを `if (!document.startViewTransition) return;` で判定し、未対応環境では既存の遷移フローをそのまま使用する。

### 2. 要素対応付けのルール
- View Transition API では「遷移前後で同じ `view-transition-name` を持つ要素同士」が補間されるため、意味単位でタグを統一する。
- 実装では `style="--tag: <unique-key>"` を要素ごとに設定し、共通 CSS で `view-transition-name: var(--tag); contain: paint;` を適用している（`app/src/app.css` 行 53-57）。
- Key には `slug` 付きの一意な文字列（例: `h-my-article`, `tag-my-article`）を使用し、遷移対象が増えても衝突しないようにする。

### 3. 一覧（`PostCard`）側のセットアップ
- `app/src/components/PostCard/PostCard.svelte` にてタイトル、説明、タグ、投稿日、サムネイル画像それぞれへ `style:--tag={...}` を設定。
- 小さいカード（`small` フラグ true）の場合はアニメーションが煩雑になる要素を除外するため `null` を返して View Transition を無効化。
- サムネイル画像は共通コンポーネント `Image.svelte` に委譲し、`style:--tag={small ? null : \`image-${slug}\`}` で定義を統一。

### 4. 詳細（`Card`）側のセットアップ
- `app/src/components/Card/Card.svelte` で記事タイトル (`h-{slug}`)、投稿日 (`time-{slug}`)、タグ群 (`tag-{slug}`)、概要 (`about-{slug}`)、メイン画像 (`image-{slug}`) を一覧と同じ key 名で指定。
- Markdown 本文や動的に生成される要素は View Transition の対象外とし、遷移コストとレイアウトジャンプを抑えている。

### 5. アクセシビリティ・フォールバック
- CSS の `@media (prefers-reduced-motion: no-preference)` で View Transition 適用ブロックを囲み、動きに敏感な利用者は OS 設定だけでアニメーションを無効化できる。
- 画像やタイトルへ `contain: paint;` を付与し、アニメーション中の再描画範囲を限定してパフォーマンスを確保。
- API 未対応ブラウザでは `onNavigate` の処理自体が早期 return するため、追加のポリフィルなしで安全に劣化。

## 実装フロー
1. 一覧・詳細双方で、アニメーションさせたい要素に `style:--tag="<名前>"` を埋め込む。  
   - 追加する要素が複数ある場合は `<意味>-<slug>` 形式で重複しない名前を作る。
2. 共通 CSS（`app/src/app.css`）内の `[style*="--tag"] { view-transition-name: var(--tag); }` が自動で適用されることを確認する。
3. `document.startViewTransition` がラップする DOM 変更の中に新要素を含めるため、Svelte コンポーネントは従来通りに更新するだけでよい。
4. ブラウザで挙動を確認し、`prefers-reduced-motion` を `reduce` にした際にアニメーションが消えるかどうかもチェックする。

## 拡張/運用上の注意
- **要素追加時**: 新しいセクションを View Transition 対象とする場合は、一覧と詳細の両方に同じ `--tag` 名を設定しない限りアニメーションは走らない。片側のみ設定すると `ViewTransition.ready` が拒否される恐れがあるため注意。
- **ページ種別の拡大**: 他のルートでも利用したい場合、`onNavigate` は全ページ共通なので、`--tag` の命名にページ固有 prefix（例: `project-`）を付けると衝突を防げる。
- **ブラウザサポート**: 2025 年時点では Chromium 系・Firefox Nightly などで実装済み。Safari では Technology Preview が必要な場合があるため、劣化許容の設計を維持する。
- **同時進行アニメーション**: `document.startViewTransition` は一度に 1 つのみ起動可能。連続クリック対策として、内部で返す Promise が解決するまで新たな遷移が開始されないよう SvelteKit がガードするが、追加で UI ロックが必要なら別途検討する。

## 参考ファイル
- `sapper-blog-app/app/src/routes/+layout.svelte`
- `sapper-blog-app/app/src/app.css`
- `sapper-blog-app/app/src/components/PostCard/PostCard.svelte`
- `sapper-blog-app/app/src/components/Card/Card.svelte`
- `sapper-blog-app/app/src/components/Image/Image.svelte`

上記ファイルに手を入れる際は、この仕様を満たすよう `--tag` の命名・View Transition API 呼び出し・アクセシビリティ配慮を崩さないこと。
