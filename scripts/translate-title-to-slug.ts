#!/usr/bin/env bun

/**
 * タイトルを英語翻訳してスラグ化するスクリプト
 *
 * 使用例:
 *   bun run scripts/translate-title-to-slug.ts "Claude Code でスキルが実行されると isMeta プロパティが付与される"
 *   => claude-code-skill-execution-ismeta-property
 */

import puppeteer from 'puppeteer';

// CI環境判定
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

// Puppeteerのlaunchメソッドを上書きしてCI環境用のオプションを追加
const originalLaunch = puppeteer.launch;
puppeteer.launch = async (options = {}) => {
  const ciArgs = isCI ? ['--no-sandbox', '--disable-setuid-sandbox'] : [];

  return originalLaunch({
    ...options,
    args: [...(options.args || []), ...ciArgs],
  });
};

// Puppeteerの上書き後にapi-translatorをインポート
const { translate } = await import('api-translator');

/**
 * 日本語タイトルを英語に翻訳してスラグ化
 */
async function translateToSlug(japaneseTitle: string): Promise<string> {
  const result = await translate(japaneseTitle, { from: 'ja', to: 'en' });
  const translatedText = result as string;

  console.error(`[翻訳結果] ${translatedText}`);

  // スラグ化処理
  const slug = translatedText
    .toLowerCase()
    // 記号を削除（ハイフン、アンダースコア以外）
    .replace(/[^\w\s-]/g, '')
    // 連続する空白をハイフンに変換
    .replace(/\s+/g, '-')
    // 連続するハイフンを1つに
    .replace(/-+/g, '-')
    // 前後のハイフンを削除
    .trim()
    .replace(/^-+|-+$/g, '');

  return slug;
}

/**
 * CLIエントリーポイント
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(
      '使用法: bun run scripts/translate-title-to-slug.ts <タイトル>',
    );
    console.error(
      '例: bun run scripts/translate-title-to-slug.ts "記事タイトル"',
    );
    process.exit(1);
  }

  const title = args.join(' ');
  console.error(`[入力] ${title}`);

  const slug = await translateToSlug(title);
  console.log(slug); // 標準出力にスラグのみ出力（GitHub Actionsで使用）
}

main();
