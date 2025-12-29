#!/usr/bin/env bun
/**
 * ブログ記事のMarkdownエンドポイントを生成するスクリプト
 *
 * contents/blog/ から直接Markdownファイルを読み込み、
 * public/blog/ ディレクトリに .md ファイルとして出力します。
 *
 * 実行タイミング: prebuild（ビルド前に自動実行）
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

async function generateMarkdownEndpoints() {
  console.log('📝 Generating markdown endpoints...');

  const contentsDir = path.join(process.cwd(), 'contents', 'blog');
  const outputDir = path.join(process.cwd(), 'public', 'blog');

  // contents/blog/ からMarkdownファイルを取得
  const files = fs.readdirSync(contentsDir).filter((f) => f.endsWith('.md'));

  // 出力ディレクトリを作成（既存の場合はクリア）
  if (fs.existsSync(outputDir)) {
    // 既存の .md ファイルのみ削除
    const existingFiles = fs.readdirSync(outputDir);
    for (const file of existingFiles) {
      if (file.endsWith('.md')) {
        fs.unlinkSync(path.join(outputDir, file));
      }
    }
  } else {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 各記事の .md ファイルを生成
  for (const file of files) {
    const filePath = path.join(contentsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    // ファイル名から日付プレフィックスを除去してslugを取得
    const slug = file.replace(/^\d{4}-\d{2}-\d{2}_/, '').replace(/\.md$/, '');

    const mdContent = `# ${data.title}\n\n${content}`;
    const outputPath = path.join(outputDir, `${slug}.md`);

    fs.writeFileSync(outputPath, mdContent, 'utf-8');
  }

  console.log(`✅ Generated ${files.length} markdown files in public/blog/`);
}

// スクリプト実行
generateMarkdownEndpoints().catch((error) => {
  console.error('❌ Error generating markdown endpoints:', error);
  process.exit(1);
});
