#!/usr/bin/env tsx
/**
 * タグ整合性チェックスクリプト
 *
 * Markdownファイル内で使用されている全てのタグが
 * マッピングテーブル(src/config/tag-slugs.ts)に登録されているかチェックします。
 *
 * ## 実行方法
 * ```bash
 * pnpm check:tags
 * # または
 * tsx scripts/check-tags.ts
 * ```
 *
 * ## 終了コード
 * - 0: 全てのタグが登録済み
 * - 1: 未登録のタグが存在する
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { TAG_SLUG_MAP } from '../src/config/tag-slugs';

const blogDir = path.join(process.cwd(), 'contents', 'blog');

async function checkTags() {
  console.log('🔍 タグ整合性チェックを開始します...\n');

  // マッピングテーブルに登録されているタグ
  const mappedTags = Object.keys(TAG_SLUG_MAP);
  console.log(
    `✅ マッピングテーブルに登録済み: ${mappedTags.length}個のタグ\n`,
  );

  // Markdownファイルから全タグを抽出
  const files = await fs.readdir(blogDir);
  const mdFiles = files.filter((file) => path.extname(file) === '.md');

  const allTags = new Set<string>();
  const fileTagMap = new Map<string, string[]>(); // ファイル名→タグリスト

  for (const file of mdFiles) {
    const filePath = path.join(blogDir, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const { data } = matter(content);

    if (data.tags && Array.isArray(data.tags)) {
      data.tags.forEach((tag: string) => allTags.add(tag));
      fileTagMap.set(file, data.tags);
    }
  }

  console.log(`📝 Markdownファイル内で使用中: ${allTags.size}個のタグ\n`);

  // 未登録タグを検出
  const unmappedTags = Array.from(allTags).filter(
    (tag) => !mappedTags.includes(tag),
  );

  if (unmappedTags.length === 0) {
    console.log('✅ 全てのタグがマッピングテーブルに登録されています！\n');
    return true;
  }

  // エラー出力
  console.error('❌ マッピングテーブルに未登録のタグが見つかりました:\n');

  for (const tag of unmappedTags.sort()) {
    console.error(`  - "${tag}"`);

    // このタグを使用しているファイルを表示
    const filesUsingTag: string[] = [];
    for (const [file, tags] of fileTagMap.entries()) {
      if (tags.includes(tag)) {
        filesUsingTag.push(file);
      }
    }

    if (filesUsingTag.length > 0) {
      console.error(`    使用ファイル: ${filesUsingTag.join(', ')}`);
    }
  }

  console.error('\n📋 修正方法:');
  console.error(
    '  1. src/config/tag-slugs.ts にマッピングを追加してください\n',
  );
  console.error('  例:\n');
  for (const tag of unmappedTags.slice(0, 3)) {
    // 最大3個まで例示
    const suggestedSlug = tag
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    console.error(`  '${tag}': '${suggestedSlug}',`);
  }

  return false;
}

// スクリプト実行
checkTags()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  });
