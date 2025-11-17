/**
 * URL前後の空行チェックスクリプト
 *
 * ブログ記事内のURLで、前後に空行がないケースを検出します。
 * これらのURLはリンクカードとして表示されない可能性があります。
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

const BLOG_DIR = path.join(process.cwd(), 'contents', 'blog');
const URL_PATTERN = /^https?:\/\/.+$/;

type IssueReport = {
  file: string;
  lineNumber: number;
  url: string;
  hasPreviousBlankLine: boolean;
  hasNextBlankLine: boolean;
  previousLine?: string;
  nextLine?: string;
};

/**
 * Markdownファイルを解析してURL前後の空行をチェック
 */
async function checkMarkdownFile(filePath: string): Promise<IssueReport[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const issues: IssueReport[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // URLのみの行を検出（リンク記法でない素のURL）
    if (URL_PATTERN.test(line)) {
      const previousLine = i > 0 ? lines[i - 1] : undefined;
      const nextLine = i < lines.length - 1 ? lines[i + 1] : undefined;

      const hasPreviousBlankLine =
        i === 0 || (previousLine !== undefined && previousLine.trim() === '');
      const hasNextBlankLine =
        i === lines.length - 1 ||
        (nextLine !== undefined && nextLine.trim() === '');

      // 前後どちらかに空行がない場合は問題として記録
      if (!hasPreviousBlankLine || !hasNextBlankLine) {
        issues.push({
          file: path.basename(filePath),
          lineNumber: i + 1,
          url: line,
          hasPreviousBlankLine,
          hasNextBlankLine,
          previousLine,
          nextLine,
        });
      }
    }
  }

  return issues;
}

/**
 * すべてのMarkdownファイルをチェック
 */
async function checkAllBlogPosts() {
  const files = await fs.readdir(BLOG_DIR);
  const markdownFiles = files.filter((file) => file.endsWith('.md'));

  const allIssues: IssueReport[] = [];

  for (const file of markdownFiles) {
    const filePath = path.join(BLOG_DIR, file);
    const issues = await checkMarkdownFile(filePath);
    allIssues.push(...issues);
  }

  return allIssues;
}

/**
 * レポートを出力
 */
function printReport(issues: IssueReport[]) {
  console.log('='.repeat(80));
  console.log('URL前後の空行チェック結果');
  console.log('='.repeat(80));
  console.log();

  if (issues.length === 0) {
    console.log('✅ 問題なし: すべてのURLに前後の空行があります');
    return;
  }

  console.log(`❌ 問題あり: ${issues.length}件のURLで空行が不足しています\n`);

  // ファイルごとにグループ化
  const byFile = issues.reduce(
    (acc, issue) => {
      if (!acc[issue.file]) {
        acc[issue.file] = [];
      }
      acc[issue.file].push(issue);
      return acc;
    },
    {} as Record<string, IssueReport[]>,
  );

  for (const [file, fileIssues] of Object.entries(byFile)) {
    console.log(`\n📄 ${file}`);
    console.log('-'.repeat(80));

    for (const issue of fileIssues) {
      console.log(`\n行 ${issue.lineNumber}: ${issue.url}`);

      if (!issue.hasPreviousBlankLine && issue.previousLine) {
        console.log(`  ⚠️  前の行に空行なし: "${issue.previousLine}"`);
      }

      if (!issue.hasNextBlankLine && issue.nextLine) {
        console.log(`  ⚠️  後の行に空行なし: "${issue.nextLine}"`);
      }

      console.log(
        `  状態: 前=${issue.hasPreviousBlankLine ? '✅' : '❌'} / 後=${issue.hasNextBlankLine ? '✅' : '❌'}`,
      );
    }
  }

  console.log('\n'.repeat(2));
  console.log('='.repeat(80));
  console.log('修正方法');
  console.log('='.repeat(80));
  console.log();
  console.log('URLの前後に空行を追加してください：');
  console.log();
  console.log('  ❌ 悪い例:');
  console.log('  テキストです。');
  console.log('  https://example.com');
  console.log('  次のテキストです。');
  console.log();
  console.log('  ✅ 良い例:');
  console.log('  テキストです。');
  console.log('  ');
  console.log('  https://example.com');
  console.log('  ');
  console.log('  次のテキストです。');
  console.log();
}

// 実行
checkAllBlogPosts()
  .then(printReport)
  .catch(console.error);
