import fs from 'node:fs';
import path from 'node:path';

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
 * 英語のstop wordsリスト（意味の薄い単語を除外）
 */
const stopWords = new Set([
	'a',
	'an',
	'and',
	'are',
	'as',
	'at',
	'be',
	'by',
	'for',
	'from',
	'has',
	'he',
	'in',
	'is',
	'it',
	'its',
	'of',
	'on',
	'that',
	'the',
	'to',
	'was',
	'will',
	'with',
	'the',
	'this',
	'but',
	'they',
	'have',
	'had',
	'what',
	'when',
	'where',
	'who',
	'which',
	'why',
	'how',
]);

/**
 * 翻訳された英文からslugを生成
 */
function generateSlugFromTranslation(translation: string): string {
	// 小文字化
	let slug = translation.toLowerCase();

	// [...] のような記号を削除
	slug = slug.replace(/\[.*?\]/g, '');

	// 句読点や記号を削除（/もハイフンに置換）
	slug = slug.replace(/[\/]/g, '-');
	slug = slug.replace(/[.,!?;:()"'%]/g, '');

	// スペースで分割
	const words = slug.split(/\s+/);

	// stop wordsを除外し、意味のある単語のみを抽出
	const meaningfulWords = words.filter(
		(word) => word.length > 0 && !stopWords.has(word) && /[a-z0-9]/.test(word),
	);

	// 最大6単語に制限（slugが長すぎないように）
	const limitedWords = meaningfulWords.slice(0, 6);

	// ハイフンで連結
	slug = limitedWords.join('-');

	// 連続するハイフンを1つに
	slug = slug.replace(/-+/g, '-');

	// 先頭と末尾のハイフンを削除
	slug = slug.replace(/^-+|-+$/g, '');

	return slug;
}

/**
 * TSVファイルをパースしてslugマッピングを作成
 */
function parseTSV(filePath: string): Map<string, string> {
	const content = fs.readFileSync(filePath, 'utf-8');

	// ```tsv と ``` で囲まれている場合は削除
	const cleanContent = content.replace(/^```tsv\s*\n/, '').replace(/\n```\s*$/, '');

	const lines = cleanContent.split('\n').filter((line) => line.trim() !== '');
	const mapping = new Map<string, string>();

	// ヘッダー行をスキップ
	for (let i = 1; i < lines.length; i++) {
		const columns = lines[i].split('\t');
		if (columns.length >= 4) {
			const fileName = columns[0].trim();
			const translation = columns[3].trim();

			if (fileName && translation) {
				const newSlug = generateSlugFromTranslation(translation);
				mapping.set(fileName, newSlug);
			}
		}
	}

	return mapping;
}

/**
 * メイン処理
 */
async function main() {
	try {
		console.log('🔄 翻訳結果からslugを生成して一括更新します...\n');

		// TSVファイルをパース
		const slugMapping = parseTSV('blog-titles-list.txt');

		console.log(`📝 処理対象: ${slugMapping.size}件\n`);

		let updatedCount = 0;

		for (const [oldFileName, newSlug] of slugMapping.entries()) {
			// ファイルパスを検索（qiita-blogとzenn-blogの両方）
			const qiitaPath = path.join('contents/qiita-blog', oldFileName);
			const zennPath = path.join('contents/zenn-blog', oldFileName);

			let filePath = '';
			if (fs.existsSync(qiitaPath)) {
				filePath = qiitaPath;
			} else if (fs.existsSync(zennPath)) {
				filePath = zennPath;
			} else {
				console.warn(`⚠️  ファイルが見つかりません: ${oldFileName}`);
				continue;
			}

			// ファイルを読み込み
			const content = fs.readFileSync(filePath, 'utf-8');
			const { frontmatter, body } = parseFrontmatter(content);

			const oldSlug = frontmatter.slug as string;

			// slugが同じ場合はスキップ
			if (oldSlug === newSlug) {
				continue;
			}

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

			console.log(`✅ ${oldFileName}`);
			console.log(`   → ${newFileName}`);
			console.log(`   slug: ${oldSlug} → ${newSlug}\n`);

			updatedCount++;
		}

		console.log(`\n🎉 更新完了: ${updatedCount}件`);
	} catch (error) {
		console.error('❌ エラーが発生しました:', error);
		process.exit(1);
	}
}

main();
