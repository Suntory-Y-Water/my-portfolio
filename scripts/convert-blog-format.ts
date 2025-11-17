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

	// 簡易的なYAMLパース（gray-matterを使わない実装）
	const frontmatter: Record<string, unknown> = {};
	let currentKey = '';
	let isArray = false;
	const lines = frontmatterText.split('\n');

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) continue;

		// 配列要素
		if (trimmed.startsWith('-')) {
			if (isArray && currentKey) {
				const value = trimmed.slice(1).trim().replace(/^["']|["']$/g, '');
				(frontmatter[currentKey] as string[]).push(value);
			}
			continue;
		}

		// キー: 値の形式
		const colonIndex = trimmed.indexOf(':');
		if (colonIndex !== -1) {
			const key = trimmed.slice(0, colonIndex).trim();
			const value = trimmed.slice(colonIndex + 1).trim();

			currentKey = key;

			if (value === '') {
				// 空の値または配列の開始
				isArray = true;
				frontmatter[key] = [];
			} else {
				isArray = false;
				// 引用符を削除
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
 * タイトルからslugを生成
 */
function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^\w\-]+/g, '')
		.replace(/\-\-+/g, '-')
		.replace(/^-+/, '')
		.replace(/-+$/, '');
}

/**
 * Qiita記事を変換
 */
async function convertQiitaArticle(filePath: string): Promise<void> {
	const content = fs.readFileSync(filePath, 'utf-8');
	const { frontmatter, body } = parseFrontmatter(content);

	// 新しいフロントマターを作成（目標フォーマットに合わせる）
	const newFrontmatter: Record<string, unknown> = {
		title: frontmatter.title || '',
		slug: frontmatter.slug || '',
		date: frontmatter.date || '',
		description: frontmatter.description || '',
		icon: frontmatter.icon || '',
		icon_url: frontmatter.icon_url || '',
		tags: frontmatter.tags || [],
	};

	// 新しいコンテンツを生成
	const newContent = stringifyFrontmatter(newFrontmatter) + body;

	// 新しいファイル名を生成
	const date = newFrontmatter.date as string;
	const slug = newFrontmatter.slug as string;
	const newFileName = `${date}_${slug}.md`;
	const newFilePath = path.join(path.dirname(filePath), newFileName);

	// ファイルを書き込み
	fs.writeFileSync(newFilePath, newContent, 'utf-8');

	// 元のファイルと新しいファイルが異なる場合、元のファイルを削除
	if (filePath !== newFilePath) {
		fs.unlinkSync(filePath);
	}

	console.log(`✅ Qiita変換完了: ${path.basename(filePath)} -> ${newFileName}`);
}

/**
 * Zenn記事を変換
 */
async function convertZennArticle(filePath: string): Promise<void> {
	const content = fs.readFileSync(filePath, 'utf-8');
	const { frontmatter, body } = parseFrontmatter(content);

	// published_atから日付を抽出
	let date = '';
	if (frontmatter.published_at) {
		const publishedAt = frontmatter.published_at as string;
		date = publishedAt.split(' ')[0]; // "YYYY-MM-DD HH:MM" -> "YYYY-MM-DD"
	}

	// タイトルからslugを生成
	const title = (frontmatter.title as string) || '';
	let slug = generateSlug(title);

	// slugが空の場合、元のファイル名（ハッシュ値）を使用
	if (!slug) {
		const fileName = path.basename(filePath, '.md');
		// ファイル名が "YYYY-MM-DD_" 形式の場合、日付部分を除去
		slug = fileName.includes('_') ? fileName.split('_')[1] : fileName;
	}

	// 新しいフロントマターを作成
	const newFrontmatter: Record<string, unknown> = {
		title,
		slug,
		date,
		description: '',
		icon: frontmatter.emoji || '',
		icon_url: '',
		tags: frontmatter.topics || [],
	};

	// 新しいコンテンツを生成
	const newContent = stringifyFrontmatter(newFrontmatter) + body;

	// 新しいファイル名を生成
	const newFileName = `${date}_${slug}.md`;
	const newFilePath = path.join(path.dirname(filePath), newFileName);

	// ファイルを書き込み
	fs.writeFileSync(newFilePath, newContent, 'utf-8');

	// 元のファイルを削除
	if (filePath !== newFilePath) {
		fs.unlinkSync(filePath);
	}

	console.log(`✅ Zenn変換完了: ${path.basename(filePath)} -> ${newFileName}`);
}

/**
 * メイン処理
 */
async function main() {
	try {
		console.log('🚀 ブログ記事のフォーマット変換を開始します...\n');

		// Qiita記事を変換
		console.log('📝 Qiita記事を変換中...');
		const qiitaFiles = await glob('contents/qiita-blog/*.md', {
			cwd: process.cwd(),
			absolute: true,
		});
		for (const file of qiitaFiles) {
			await convertQiitaArticle(file);
		}
		console.log(`\n✅ Qiita記事の変換完了: ${qiitaFiles.length}件\n`);

		// Zenn記事を変換
		console.log('📝 Zenn記事を変換中...');
		const zennFiles = await glob('contents/zenn-blog/*.md', {
			cwd: process.cwd(),
			absolute: true,
		});
		for (const file of zennFiles) {
			await convertZennArticle(file);
		}
		console.log(`\n✅ Zenn記事の変換完了: ${zennFiles.length}件\n`);

		console.log('🎉 すべての変換が完了しました！');
	} catch (error) {
		console.error('❌ エラーが発生しました:', error);
		process.exit(1);
	}
}

main();
