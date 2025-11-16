#!/usr/bin/env tsx
/**
 * ブログアイコン自動変換スクリプト
 *
 * ブログ記事のフロントマターにある`icon`フィールドの絵文字を、
 * FluentUI EmojiのURLに自動変換して`icon_url`フィールドを生成します。
 *
 * ## 動作
 * 1. contents/blogディレクトリ配下の全.mdファイルをスキャン
 * 2. `icon`フィールドが絵文字の場合、FluentUI EmojiのURLを生成
 * 3. `icon_url`フィールドが存在しない場合のみ追加
 * 4. 既に`icon_url`が存在する場合はスキップ
 *
 * ## 実行方法
 * ```bash
 * # 全ブログファイルを処理
 * bun run scripts/update-blog-icon.ts
 *
 * # 特定のファイルのみ処理（pre-commitフックで使用）
 * bun run scripts/update-blog-icon.ts contents/blog/2025-11-15_example.md
 * ```
 *
 * ## 使用例
 * ### 変換前のフロントマター
 * ```yaml
 * ---
 * title: サンプル記事
 * icon: 🔥
 * ---
 * ```
 *
 * ### 変換後のフロントマター
 * ```yaml
 * ---
 * title: サンプル記事
 * icon: 🔥
 * icon_url: https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Fire/Flat/fire_flat.svg
 * ---
 * ```
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { convertEmojiToFluentUrl } from '@/lib/emoji-converter';

const blogDir = path.join(process.cwd(), 'contents', 'blog');

/**
 * ブログファイルのフロントマターパラメータ
 */
type BlogFileParams = {
  /** ブログファイルのパス */
  filePath: string;
};

/**
 * ブログファイルのフロントマターを更新する
 *
 * ファイルを読み込み、`icon`フィールドが絵文字の場合に`icon_url`フィールドを生成します。
 * 既に`icon_url`が存在する場合、または`icon`フィールドがない場合はスキップします。
 *
 * @param params - ブログファイルのパラメータ
 * @returns 処理結果メッセージ
 *
 * @example
 * ```ts
 * const result = await updateBlogIconUrl({
 *   filePath: 'contents/blog/2025-11-15_example.md'
 * });
 * // => '✅ Updated: 2025-11-15_example.md' または 'ℹ️  Skipped: ...'
 * ```
 */
async function updateBlogIconUrl({
  filePath,
}: BlogFileParams): Promise<string> {
  const content = await fs.readFile(filePath, 'utf-8');
  const { data: frontmatter } = matter(content);

  // iconフィールドが存在しない場合はスキップ
  if (!frontmatter.icon) {
    return `ℹ️  Skipped: ${path.basename(filePath)} (no icon field)`;
  }

  // icon_urlフィールドが既に値を持つ場合はスキップ
  if (frontmatter.icon_url && frontmatter.icon_url.trim() !== '') {
    return `ℹ️  Skipped: ${path.basename(filePath)} (icon_url already exists)`;
  }

  let iconUrl: string;

  // iconフィールドが既にURLの場合はそのまま使用
  if (
    typeof frontmatter.icon === 'string' &&
    frontmatter.icon.startsWith('http')
  ) {
    iconUrl = frontmatter.icon;
  } else {
    // 絵文字をFluentUI EmojiのURLに変換
    iconUrl = convertEmojiToFluentUrl({ icon: frontmatter.icon });

    // 変換できなかった場合（絵文字データが見つからない）はスキップ
    if (iconUrl === frontmatter.icon) {
      return `⚠️  Warning: ${path.basename(filePath)} (could not convert emoji: ${frontmatter.icon})`;
    }
  }

  // icon_url:の値を更新（YAMLフォーマットを保持）
  // mフラグなしで改行の前までマッチ
  const iconUrlRegex = /icon_url:[^\n]*/;
  const match = content.match(iconUrlRegex);

  if (!match) {
    return `⚠️  Warning: ${path.basename(filePath)} (could not find icon_url field)`;
  }

  const updatedContent = content.replace(iconUrlRegex, `icon_url: ${iconUrl}`);

  // ファイルに書き戻す
  await fs.writeFile(filePath, updatedContent, 'utf-8');

  return `✅ Updated: ${path.basename(filePath)}`;
}

/**
 * 全ブログファイルまたは指定されたファイルを処理する
 *
 * コマンドライン引数にファイルパスが指定されている場合はそのファイルのみを処理し、
 * 指定されていない場合はcontents/blogディレクトリ配下の全.mdファイルを処理します。
 *
 * @example
 * ```ts
 * // 全ファイルを処理
 * await processBlogs();
 *
 * // 特定のファイルのみ処理
 * process.argv = ['node', 'script.js', 'contents/blog/example.md'];
 * await processBlogs();
 * ```
 */
async function processBlogs(): Promise<void> {
  const targetFiles = process.argv.slice(2);

  let filesToProcess: string[] = [];

  if (targetFiles.length > 0) {
    // 引数で指定されたファイルのみ処理
    // .mdファイルのみをフィルタリング
    filesToProcess = targetFiles.filter(
      (file) => file.endsWith('.md') && file.includes('contents/blog'),
    );

    if (filesToProcess.length === 0) {
      console.log('ℹ️  No blog markdown files to process.');
      return;
    }
  } else {
    // 全ブログファイルを処理
    const files = await fs.readdir(blogDir);
    filesToProcess = files
      .filter((file) => file.endsWith('.md'))
      .map((file) => path.join(blogDir, file));
  }

  console.log(`\n🔄 Processing ${filesToProcess.length} blog file(s)...\n`);

  const results = await Promise.all(
    filesToProcess.map((file) => updateBlogIconUrl({ filePath: file })),
  );

  for (const result of results) {
    console.log(result);
  }

  const updatedCount = results.filter((r) => r.startsWith('✅')).length;
  const skippedCount = results.filter((r) => r.startsWith('ℹ️')).length;
  const warningCount = results.filter((r) => r.startsWith('⚠️')).length;

  console.log('\n📊 Summary:');
  console.log(`  Updated: ${updatedCount}`);
  console.log(`  Skipped: ${skippedCount}`);
  console.log(`  Warnings: ${warningCount}`);
  console.log('');
}

// スクリプト実行
processBlogs().catch((error) => {
  console.error('❌ Error occurred:', error);
  process.exit(1);
});
