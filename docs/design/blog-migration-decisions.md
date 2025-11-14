# ブログ移行 意思決定記録

## 決定日
2025-11-14

## 決定事項

### 1. LinkPreview実装方式
~~**決定**: remarkプラグイン活用~~

**【変更: 2025-11-14】カスタムrehypeプラグイン実装**

**理由**:
- npmの`remark-link-card`はエラー時にURLが消失する問題
- 既存の`getOGData` Server Actionを再利用可能
- エラーハンドリングが確実（フォールバック表示）
- SSGでビルド時にOG情報を取得・キャッシュ

**実装内容**:
- `src/lib/rehype-link-card.ts` でカスタムrehypeプラグイン
- `@/actions/fetch-og-metadata`の`getOGData`を使用
- `allowDangerousHtml`で静的HTML生成
- エラー時はURLを消さずフォールバック表示

**代替案**:
- ~~カスタムremarkプラグイン開発（保守コスト高）~~ → 採用
- 機能廃止（UX低下） → 不採用

---

### 2. フロントマター形式
**決定**: 現状維持

**理由**:
- 移行コストが低い
- 既存の13記事のフロントマターをそのまま使える
- シンプルで十分な機能

**現行形式**:
```yaml
title: ...
date: 2025-03-17
description: ...
icon: https://...
tags:
  - ...
```

**代替案**:
- azukiazusa.dev形式（id, slug, createdAt, updatedAt, published）
  - より詳細だが移行コストが高い

---

### 3. 移行方式
**決定**: 一括移行

**理由**:
- 整合性の維持が容易
- 13記事と規模が小さい
- 段階的移行による複雑さを避ける

**代替案**:
- 段階的移行（新記事からMDで書く）
  - MDXとMDが混在し管理が複雑化

---

### 4. 画像管理方式
**決定**: 現状維持（Cloudflare R2 + CDN）

**理由**:
- 既存の画像配信基盤が機能している
- CDNによる高速配信
- content/配下に画像を置くとリポジトリが肥大化

**代替案**:
- content/配下に画像を配置
  - Obsidianで相対パス参照が容易だが、リポジトリサイズ増加

---

## 影響範囲

- 全13記事のMDX→MD変換
- ビルドシステムの変更（@mdx-js/mdx → unified）
- remarkプラグインの追加（remark-link-card, remark-alerts等）

## 次のステップ

Phase 1: プロトタイプ検証に進む
