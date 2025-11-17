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
 * フロントマターを文字列に変換
 */
function stringifyFrontmatter(frontmatter: Record<string, unknown>): string {
	let result = '---\n';

	for (const [key, value] of Object.entries(frontmatter)) {
		if (Array.isArray(value)) {
			result += `${key}:\n`;
			for (const item of value) {
				result += `  - ${item}\n`;
			}
		} else {
			result += `${key}: ${value}\n`;
		}
	}

	result += '---\n';
	return result;
}

/**
 * タイトルから簡易的なslugを生成（日本語対応）
 */
function generateSimpleSlug(title: string): string {
	// 日本語を含む場合、最初の英数字部分を使用するか、ランダムな文字列を生成
	const words = title.split(/\s+/);
	const englishWords = words
		.map((word) => word.toLowerCase().replace(/[^\w-]+/g, ''))
		.filter((word) => word.length > 0);

	if (englishWords.length > 0) {
		return englishWords.slice(0, 5).join('-');
	}

	// 完全に日本語の場合、タイトルの最初の数文字をローマ字風に変換
	// ここでは簡易的にランダムなハッシュを生成
	const hash = Math.random().toString(36).substring(2, 15);
	return hash;
}

/**
 * 空のslugを修正
 */
async function fixEmptySlug(filePath: string): Promise<void> {
	const content = fs.readFileSync(filePath, 'utf-8');
	const { frontmatter, body } = parseFrontmatter(content);

	const slug = frontmatter.slug;

	// slugが空、未定義、または配列の場合のみ処理
	const isEmpty =
		!slug ||
		slug === '' ||
		(typeof slug === 'string' && slug.trim() === '') ||
		(Array.isArray(slug) && slug.length === 0);

	if (isEmpty) {
		// タイトルから新しいslugを生成
		const title = (frontmatter.title as string) || '';
		const newSlug = generateSimpleSlug(title);

		// フロントマターを更新
		frontmatter.slug = newSlug;

		// 新しいコンテンツを生成
		const newContent = stringifyFrontmatter(frontmatter) + body;

		// 新しいファイル名を生成
		const date = frontmatter.date as string;
		const newFileName = `${date}_${newSlug}.md`;
		const newFilePath = path.join(path.dirname(filePath), newFileName);

		// ファイルを書き込み
		fs.writeFileSync(newFilePath, newContent, 'utf-8');

		// 元のファイルを削除
		if (filePath !== newFilePath) {
			fs.unlinkSync(filePath);
		}

		console.log(`✅ Slug修正完了: ${path.basename(filePath)} -> ${newFileName}`);
	}
}

/**
 * メイン処理
 */
async function main() {
	try {
		console.log('🔧 空のslugを修正します...\n');

		// Zenn記事を確認
		const zennFiles = await glob('contents/zenn-blog/*.md', {
			cwd: process.cwd(),
			absolute: true,
		});

		let fixedCount = 0;
		for (const file of zennFiles) {
			const content = fs.readFileSync(file, 'utf-8');
			const { frontmatter } = parseFrontmatter(content);
			const slug = frontmatter.slug;

			// slugが空、未定義、または配列の場合
			const isEmpty =
				!slug ||
				slug === '' ||
				(typeof slug === 'string' && slug.trim() === '') ||
				(Array.isArray(slug) && slug.length === 0);

			if (isEmpty) {
				await fixEmptySlug(file);
				fixedCount++;
			}
		}

		console.log(`\n✅ 修正完了: ${fixedCount}件`);
	} catch (error) {
		console.error('❌ エラーが発生しました:', error);
		process.exit(1);
	}
}

main();
