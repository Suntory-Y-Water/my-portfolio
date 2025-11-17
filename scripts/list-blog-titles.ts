import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';

/**
 * フロントマターを解析する
 */
function parseFrontmatter(content: string): { frontmatter: Record<string, unknown>; body: string } {
	const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) {
		throw new Error('フロントマターが見つかりません');
	}

	const frontmatterText = match[1];
	const body = match[2];

	const frontmatter: Record<string, unknown> = {};
	let currentKey = '';
	let isArray = false;
	const lines = frontmatterText.split('\n');

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) continue;

		if (trimmed.startsWith('-')) {
			if (isArray && currentKey) {
				const value = trimmed.slice(1).trim().replace(/^["']|["']$/g, '');
				(frontmatter[currentKey] as string[]).push(value);
			}
			continue;
		}

		const colonIndex = trimmed.indexOf(':');
		if (colonIndex !== -1) {
			const key = trimmed.slice(0, colonIndex).trim();
			const value = trimmed.slice(colonIndex + 1).trim();

			currentKey = key;

			if (value === '') {
				isArray = true;
				frontmatter[key] = [];
			} else {
				isArray = false;
				frontmatter[key] = value.replace(/^["']|["']$/g, '');
			}
		}
	}

	return { frontmatter, body };
}

/**
 * メイン処理
 */
async function main() {
	try {
		console.log('📝 ブログ記事のタイトルとファイル名を一覧出力します...\n');

		// すべてのQiitaとZennファイルを取得
		const qiitaFiles = await glob('contents/qiita-blog/*.md', {
			cwd: process.cwd(),
			absolute: true,
		});

		const zennFiles = await glob('contents/zenn-blog/*.md', {
			cwd: process.cwd(),
			absolute: true,
		});

		const allFiles = [...qiitaFiles, ...zennFiles].sort();

		console.log(`対象ファイル数: ${allFiles.length}件\n`);

		// CSV形式で出力
		console.log('ファイル名,現在のslug,タイトル,推奨slug');
		console.log('---');

		const results: Array<{
			fileName: string;
			currentSlug: string;
			title: string;
			suggestedSlug: string;
		}> = [];

		for (const filePath of allFiles) {
			const content = fs.readFileSync(filePath, 'utf-8');
			const { frontmatter } = parseFrontmatter(content);

			const fileName = path.basename(filePath);
			const title = (frontmatter.title as string) || '';
			const currentSlug = (frontmatter.slug as string) || '';

			results.push({
				fileName,
				currentSlug,
				title,
				suggestedSlug: '', // ユーザーが記入
			});

			console.log(`${fileName},${currentSlug},"${title}",`);
		}

		// Markdown形式でも出力
		console.log('\n\n## Markdown形式\n');
		console.log('| ファイル名 | 現在のslug | タイトル | 推奨slug |');
		console.log('|-----------|-----------|---------|---------|');

		for (const result of results) {
			console.log(
				`| ${result.fileName} | ${result.currentSlug} | ${result.title} | (ここに記入) |`,
			);
		}

		console.log('\n✅ 完了しました！');
		console.log(
			'\n上記の出力をコピーして、推奨slugを記入してください。\n記入後、別のスクリプトで一括更新します。',
		);
	} catch (error) {
		console.error('❌ エラーが発生しました:', error);
		process.exit(1);
	}
}

main();
