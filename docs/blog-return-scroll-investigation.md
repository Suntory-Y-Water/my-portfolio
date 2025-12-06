# ブログ戻り導線のスクロール復元 調査メモ

## 現状
- 戻り導線: 保存された一覧パスがあれば最優先で `router.push`。なければ `router.back()`、履歴が無ければ `/blog`。スクロール位置の復元は行わない。
- 一覧パス保存: `/blog`, `/blog/page/[page]` で sessionStorage に現在のパスを保存(キー: `BLOG_NAVIGATION_CONSTANTS.LIST_PATH_STORAGE_KEY`)。
- 実装位置: 戻りボタン `src/components/feature/content/blog-back-button.tsx`、保存 `src/components/feature/content/remember-blog-list-path.tsx`。

## 方針
- 同じパスに戻ることのみ保証し、スクロール位置の復元は要件外とする。

## これまでの変遷メモ
- 初期: `router.push` デフォルト(先頭スクロール)。
- 途中: `{ scroll: false }` ＋ sessionStorage でスクロール復元を試行。
- 現在: パスのみ sessionStorage で保存、戻りは保存パス → 履歴 → `/blog`。
