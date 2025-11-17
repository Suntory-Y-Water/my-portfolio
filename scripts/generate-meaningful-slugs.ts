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
 * 日本語から英語slugへのマッピング辞書
 */
const keywordMapping: Record<string, string> = {
	// 技術用語
	セブンイレブン: 'seven-eleven',
	最適: 'optimal',
	食品: 'food',
	線形計画法: 'linear-programming',
	基本情報技術者試験: 'fundamental-information-technology-engineer',
	応用情報技術者試験: 'applied-information-technology-engineer',
	合格: 'pass',
	体験記: 'experience',
	不合格: 'fail',
	MySQL: 'mysql',
	CSV: 'csv',
	ファイル: 'file',
	インポート: 'import',
	データベース: 'database',
	Python: 'python',
	BeautifulSoup: 'beautifulsoup',
	Java: 'java',
	コンパイル: 'compile',
	PyAutoGUI: 'pyautogui',
	画像認識: 'image-recognition',
	拡大比率: 'scale-ratio',
	リーダブルコード: 'readable-code',
	雑記: 'note',
	心臓: 'health',
	負荷: 'stress',
	光: 'light',
	目覚め: 'wake-up',
	技術書: 'tech-book',
	読書術: 'reading-technique',
	Django: 'django',
	テンプレート: 'template',
	タグ: 'tag',
	空白: 'whitespace',
	Excel: 'excel',
	便利: 'useful',
	小技: 'tips',
	定型作業: 'routine-work',
	自動化: 'automation',
	Anaconda: 'anaconda',
	システム環境変数: 'system-environment-variables',
	設定: 'settings',
	自然言語処理: 'nlp',
	'discord.py': 'discord-py',
	ネガティブ: 'negative',
	単語: 'word',
	bot: 'bot',
	Kindle: 'kindle',
	ハイライト: 'highlight',
	削除: 'delete',
	メルカリ: 'mercari',
	Shops: 'shops',
	再出品: 'relist',
	効率化: 'efficiency',
	ChatGPT: 'chatgpt',
	要約: 'summarize',
	React: 'react',
	フロントエンド: 'frontend',
	ランダム: 'random',
	ラーメン二郎: 'ramen-jiro',
	Flask: 'flask',
	連携: 'integration',
	TypeScript: 'typescript',
	interface: 'interface',
	type: 'type',
	Selenium: 'selenium',
	バレバレ: 'detection',
	密結合: 'tight-coupling',
	疎結合: 'loose-coupling',
	理解: 'understanding',
	コールバック: 'callback',
	関数: 'function',
	アルゴリズム: 'algorithm',
	GPT: 'gpt',
	先生: 'teacher',
	Postman: 'postman',
	localhost: 'localhost',
	リクエスト: 'request',
	送信: 'send',
	Angular: 'angular',
	練習: 'practice',
	船橋市: 'funabashi',
	人口推移: 'population-transition',
	グラフ: 'graph',
	BookNotion: 'booknotion',
	神アプリ: 'great-app',
	爆誕: 'birth',
	個人開発: 'personal-development',
	水瀬いのり: 'minase-inori',
	ライブ: 'live',
	聴く: 'listen',
	曲: 'song',
	一覧表示: 'list-display',
	確率: 'probability',
	ドオー: 'doh',
	ポケモン: 'pokemon',
	生成: 'generate',
	サイト: 'site',
	ダークパターン: 'dark-pattern',
	'shadcn/ui': 'shadcn-ui',
	作成: 'create',
	'Next.js': 'nextjs',
	デプロイ: 'deploy',
	API: 'api',
	パス: 'path',
	動的: 'dynamic',
	支離滅裂: 'nonsense',
	文章: 'text',
	アプリ: 'app',
	FastAPI: 'fastapi',
	id: 'id',
	uuid: 'uuid',
	型定義: 'type-definition',
	'Google Places API': 'google-places-api',
	言語コード: 'language-code',
	沼: 'trouble',
	SQLAlchemy: 'sqlalchemy',
	pytest: 'pytest',
	RuntimeError: 'runtime-error',
	'Event loop': 'event-loop',
	不動産: 'real-estate',
	情報: 'information',
	ライブラリ: 'library',
	使う: 'use',
	コンビニ: 'convenience-store',
	スイーツ: 'sweets',
	'LINE BOT': 'line-bot',
	ベッドメイキング: 'bed-making',
	毎日: 'daily',
	HonoX: 'honox',
	金髪: 'blonde',
	ヒロイン: 'heroine',
	Web: 'web',
	Webサイト: 'website',
	Vitest: 'vitest',
	テスト: 'test',
	Hono: 'hono',
	DI: 'di',
	InversifyJS: 'inversifyjs',
	'Service Bindings': 'service-bindings',
	Docker: 'docker',
	PostgreSQL: 'postgresql',
	環境構築: 'environment-setup',
	Markdown: 'markdown',
	PowerPoint: 'powerpoint',
	Marp: 'marp',
	スライド: 'slide',
	ニート: 'neet',
	社会人: 'working-adult',
	睡眠: 'sleep',
	質: 'quality',
	変化: 'change',
	調べる: 'analyze',
	アーキテクチャ: 'architecture',
	クリーン: 'clean',
	手を動かす: 'hands-on',
	'Branded Type': 'branded-type',
	型安全: 'type-safe',
	Playwright: 'playwright',
	URL: 'url',
	'GitHub Actions': 'github-actions',
	セキュリティ: 'security',
	対策: 'measures',
	'App Router': 'app-router',
	OGP: 'ogp',
	'Tailwind CSS': 'tailwind-css',
	カスタマイズ: 'customize',
	Wikipedia: 'wikipedia',
	検索: 'search',
	WebAPI: 'webapi',
	開発: 'development',
	Dependabot: 'dependabot',
	自動更新: 'auto-update',
	'Cloudflare Workers': 'cloudflare-workers',
	'Illegal invocation': 'illegal-invocation',
	エラー: 'error',
	解決: 'fix',
	pretooluse: 'pretooluse',
	'failed with non-blocking status code 127': 'failed-status-code-127',
	'Dev Container': 'dev-container',
	'Serena MCP': 'serena-mcp',
	'Stop Hooks': 'stop-hooks',
	'Notion API': 'notion-api',
	GAS: 'gas',
	スプレッドシート: 'spreadsheet',
	連携: 'integration',
	Anthropic: 'anthropic',
	MCP: 'mcp',
	サーバー: 'server',
	Obsidian: 'obsidian',
	ハンズオン: 'hands-on',
	チンチロ: 'chinchiro',
	ゲーム: 'game',
	Pod: 'pod',
	// 時間・期間
	年: 'year',
	年度: 'year',
	秋: 'fall',
	春: 'spring',
	夏: 'summer',
	冬: 'winter',
	令和: 'reiwa',
	// その他
	の: '',
	で: '',
	を: '',
	に: '',
	が: '',
	は: '',
	と: '',
	// 否定・接続詞
	不: '',
	非: '',
	// 疑問
	か: '',
	？: '',
	'?': '',
};

/**
 * 全角数字を半角数字に変換
 */
function convertFullWidthToHalfWidth(str: string): string {
	return str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));
}

/**
 * 日本語タイトルから英語slugを生成
 */
function generateMeaningfulSlug(title: string): string {
	// 全角数字を半角に変換
	let slug = convertFullWidthToHalfWidth(title);

	// 全角記号も半角に
	slug = slug.replace(/％/g, 'percent');

	// タイトルを小文字に変換
	slug = slug.toLowerCase();

	// 【】や「」などの記号を削除
	slug = slug.replace(/【|】|「|」|『|』|（|）|\(|\)|〜|～|！|？|!|\?|"|"|'|'|"/g, '');

	// 既知のキーワードを英語に置換（大文字小文字を区別しない）
	// 長いキーワードから順に置換（部分一致を防ぐ）
	const sortedMapping = Object.entries(keywordMapping).sort((a, b) => b[0].length - a[0].length);

	for (const [japanese, english] of sortedMapping) {
		if (english === '') continue; // 助詞は残さない
		const regex = new RegExp(japanese, 'gi');
		slug = slug.replace(regex, `-${english}-`);
	}

	// 数字の前後にハイフンを追加（単語として扱う）
	slug = slug.replace(/(\d+)/g, '-$1-');

	// 残った日本語文字を削除（ひらがな、カタカナ、漢字）
	slug = slug.replace(/[ぁ-んァ-ヶー一-龯、。]/g, '');

	// スペースやその他の記号をハイフンに置換
	slug = slug.replace(/[\s_\+\.]+/g, '-');

	// 連続するハイフンを1つに
	slug = slug.replace(/-+/g, '-');

	// 先頭と末尾のハイフンを削除
	slug = slug.replace(/^-+|-+$/g, '');

	// 空の場合はランダムなハッシュを生成
	if (!slug) {
		slug = Math.random().toString(36).substring(2, 15);
	}

	return slug;
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
 * メイン処理
 */
async function main() {
	try {
		console.log('🔄 意味のあるslugを生成します...\n');

		// すべてのQiitaとZennファイルを取得
		const qiitaFiles = await glob('contents/qiita-blog/*.md', {
			cwd: process.cwd(),
			absolute: true,
		});

		const zennFiles = await glob('contents/zenn-blog/*.md', {
			cwd: process.cwd(),
			absolute: true,
		});

		const allFiles = [...qiitaFiles, ...zennFiles];

		console.log(`📝 処理対象: ${allFiles.length}件\n`);

		for (const filePath of allFiles) {
			const content = fs.readFileSync(filePath, 'utf-8');
			const { frontmatter, body } = parseFrontmatter(content);

			const title = (frontmatter.title as string) || '';
			const oldSlug = frontmatter.slug as string;
			const newSlug = generateMeaningfulSlug(title);

			// slugが変更される場合のみ処理
			if (oldSlug !== newSlug) {
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

				console.log(
					`✅ ${path.basename(filePath)}\n   → ${newFileName}\n   タイトル: ${title}\n`,
				);
			}
		}

		console.log('\n🎉 すべての変換が完了しました！');
	} catch (error) {
		console.error('❌ エラーが発生しました:', error);
		process.exit(1);
	}
}

main();
