#!/usr/bin/env tsx
/**
 * ブログアイコン自動変換スクリプト
 *
 * ブログ記事のフロントマターにある`icon`をFluent UI Emoji URLへ変換し、
 * アイコンSVGをローカルにキャッシュして`icon_url`をローカルパスに更新します。
 * 同じアイコンはファイル名(basename)で使い回します。
 *
 * ## 動作
 * 1. contents/blog配下の.mdをスキャン
 * 2. iconが絵文字ならFluent URLを生成、URLならそのまま使用
 * 3. アイコンをダウンロードして public/icons/{basename}.svg に保存(重複はスキップ)
 * 4. frontmatterの icon_url を /icons/{basename}.svg に書き換え(存在しなければ追記)
 *
 * ## 実行例
 * bun run scripts/update-blog-icon.ts          # 全記事
 * bun run scripts/update-blog-icon.ts file.md  # 単体
 * bun run scripts/update-blog-icon.ts --force  # 既存キャッシュを上書き
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { convertEmojiToFluentUrl } from '@/lib/emoji-converter';

const blogDir = path.join(process.cwd(), 'contents', 'blog');
const iconsDir = path.join(process.cwd(), 'public', 'icons');

async function fileExists(filePath: string) {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function downloadIcon(url: string, destPath: string, force: boolean) {
  if (!force && (await fileExists(destPath))) {
    return;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download icon: ${url} (${res.status})`);
  }

  await fs.mkdir(path.dirname(destPath), { recursive: true });
  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(destPath, buffer);
}

function insertOrReplaceIconUrl(content: string, localIconUrl: string): string {
  const iconUrlRegex = /^icon_url:[^\n]*/m;
  const iconRegex = /^icon:[^\n]*/m;

  if (iconUrlRegex.test(content)) {
    return content.replace(iconUrlRegex, `icon_url: ${localIconUrl}`);
  }

  if (iconRegex.test(content)) {
    return content.replace(
      iconRegex,
      (match) => `${match}\nicon_url: ${localIconUrl}`,
    );
  }

  // icon行も無い場合は末尾に追記
  return `${content.trimEnd()}\nicon_url: ${localIconUrl}\n`;
}

async function resolveRemoteIconUrl(icon?: unknown, iconUrl?: unknown) {
  if (typeof icon === 'string') {
    if (icon.startsWith('http')) {
      return icon;
    }
    // 絵文字をFluent UI Emoji URLに
    const url = await convertEmojiToFluentUrl({ icon });
    return url === icon ? undefined : url;
  }

  if (typeof iconUrl === 'string' && iconUrl.startsWith('http')) {
    return iconUrl;
  }

  return undefined;
}

async function updateBlogIconUrl({
  filePath,
  force = false,
}: {
  filePath: string;
  force?: boolean;
}): Promise<string> {
  const content = await fs.readFile(filePath, 'utf-8');
  const { data: frontmatter } = matter(content);

  const remoteIconUrl = await resolveRemoteIconUrl(
    frontmatter.icon,
    frontmatter.icon_url,
  );
  if (!remoteIconUrl) {
    return `ℹ️  Skipped: ${path.basename(filePath)} (no icon)`;
  }

  const parsed = new URL(remoteIconUrl);
  const baseName = path.basename(parsed.pathname) || 'icon.svg';
  const localFileName = baseName;
  const localIconPath = path.join(iconsDir, localFileName);
  const localIconUrl = `/icons/${localFileName}`;

  await downloadIcon(remoteIconUrl, localIconPath, force);

  const updatedContent = insertOrReplaceIconUrl(content, localIconUrl);
  await fs.writeFile(filePath, updatedContent, 'utf-8');

  return `✅ Updated: ${path.basename(filePath)} -> ${localIconUrl}`;
}

async function processBlogs() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const targetFiles = args.filter((arg) => arg !== '--force');

  let filesToProcess: string[] = [];

  if (targetFiles.length > 0) {
    filesToProcess = targetFiles.filter(
      (file) => file.endsWith('.md') && file.includes('contents/blog'),
    );
  } else {
    const files = await fs.readdir(blogDir);
    filesToProcess = files
      .filter((file) => file.endsWith('.md'))
      .map((file) => path.join(blogDir, file));
  }

  if (filesToProcess.length === 0) {
    console.log('ℹ️  No blog markdown files to process.');
    return;
  }

  console.log(
    `\n🔄 Processing ${filesToProcess.length} blog file(s)${
      force ? ' (force mode)' : ''
    }...\n`,
  );

  const results = await Promise.all(
    filesToProcess.map((file) => updateBlogIconUrl({ filePath: file, force })),
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
  console.log(`  Warnings: ${warningCount}\n`);
}

processBlogs().catch((error) => {
  console.error('❌ Error occurred:', error);
  process.exit(1);
});
