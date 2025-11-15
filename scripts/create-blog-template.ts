#!/usr/bin/env tsx
/**
 * ブログテンプレート生成スクリプト
 *
 * 新規ブログ記事のテンプレートファイルを生成します。
 * ファイル名は yyyy-mm-dd_slug.md 形式で自動生成されます。
 *
 * ## 実行方法
 * ```bash
 * pnpm run new-blog my-new-article
 * # または
 * tsx scripts/create-blog-template.ts my-new-article
 * ```
 *
 * ## 生成されるファイル
 * contents/blog/2025-11-15_my-new-article.md
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

const blogDir = path.join(process.cwd(), 'contents', 'blog');

async function createBlogTemplate() {
  // コマンドライン引数からslugを取得
  const slug = process.argv[2];

  if (!slug) {
    console.error('❌ エラー: slugを指定してください\n');
    console.error('使用方法:');
    console.error('  pnpm run new-blog <slug>\n');
    console.error('例:');
    console.error('  pnpm run new-blog my-new-article');
    process.exit(1);
  }

  // slug検証（英数字とハイフンのみ）
  if (!/^[a-z0-9-]+$/.test(slug)) {
    console.error('❌ エラー: slugは英数字とハイフン(-)のみ使用できます');
    console.error(`  不正な値: "${slug}"`);
    process.exit(1);
  }

  // 現在日付を取得（yyyy-mm-dd形式）
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  // ファイル名生成
  const filename = `${dateStr}_${slug}.md`;
  const filePath = path.join(blogDir, filename);

  // 既存ファイルチェック
  try {
    await fs.access(filePath);
    console.error(`❌ エラー: ファイルが既に存在します: ${filename}`);
    process.exit(1);
  } catch {
    // ファイルが存在しない場合は続行
  }

  // テンプレート生成
  const template = `---
title:
slug: ${slug}
date: ${dateStr}
description:
icon:
tags:
  -
---

##

`;

  // ファイル書き込み
  await fs.writeFile(filePath, template, 'utf-8');

  console.log('✅ ブログテンプレートを作成しました！\n');
  console.log(`📝 ファイル: ${filename}`);
  console.log(`📂 パス: ${filePath}\n`);
  console.log('次のステップ:');
  console.log('  1. タイトル、説明、タグを記入');
  console.log('  2. 本文を執筆');
  console.log('  3. 新規タグを追加した場合は src/config/tag-slugs.ts に登録');
  console.log('  4. pnpm run check:tags でタグをチェック');
  console.log('  5. git commit & push\n');
}

// スクリプト実行
createBlogTemplate().catch((error) => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});
