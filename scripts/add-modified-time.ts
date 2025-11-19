/**
 * 既存のブログ記事に modified_time フィールドを追加するスクリプト
 *
 * すべてのブログ記事のfrontmatterに modified_time フィールドを追加します。
 * 初期値は date フィールドと同じ値に設定されます。
 * フォーマットを保持するため、文字列操作で追加します。
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

const blogDir = path.join(process.cwd(), 'contents', 'blog');

async function addModifiedTimeToAllPosts() {
  const files = (await fs.readdir(blogDir)).filter((file) =>
    file.endsWith('.md'),
  );

  let updatedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    const filePath = path.join(blogDir, file);
    const content = await fs.readFile(filePath, 'utf-8');

    // すでに modified_time が存在する場合はスキップ
    if (content.includes('modified_time:')) {
      console.log(`⏭️  スキップ: ${file} (modified_time が既に存在)`);
      skippedCount++;
      continue;
    }

    // date フィールドを検索して値を取得
    const dateMatch = content.match(/^date:\s*(.+)$/m);
    if (!dateMatch) {
      console.warn(`⚠️  警告: ${file} には date フィールドがありません`);
      skippedCount++;
      continue;
    }

    const dateValue = dateMatch[1].trim();

    // date フィールドの直後に modified_time を挿入
    const updatedContent = content.replace(
      /^(date:\s*.+)$/m,
      `$1\nmodified_time: ${dateValue}`,
    );

    // ファイルに書き込み
    await fs.writeFile(filePath, updatedContent, 'utf-8');
    console.log(`✅ 更新: ${file} (modified_time: ${dateValue})`);
    updatedCount++;
  }

  console.log('\n📊 完了:');
  console.log(`  - 更新: ${updatedCount} 件`);
  console.log(`  - スキップ: ${skippedCount} 件`);
}

addModifiedTimeToAllPosts().catch((error) => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});
