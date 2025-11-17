import type { TOCItem } from '@/components/feature/content/table-of-contents';

/**
 * MarkdownからH2とH3の見出しを抽出して階層的な目次を生成する
 *
 * @param content - Markdownの生のコンテンツ
 * @returns 目次項目の配列（H2の下にH3がネストされる）
 */
export function extractTOC(content: string): TOCItem[] {
  // 改行でコンテンツを分割
  const lines = content.split('\n');

  const result: TOCItem[] = [];
  let currentH2: TOCItem | null = null;
  let inCodeBlock = false;

  // 各行を走査
  for (const line of lines) {
    // コードブロックの開始・終了を検出（```で始まる行）
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    // コードブロック内の行はスキップ
    if (inCodeBlock) {
      continue;
    }

    // ## から始まる行はh2要素
    if (line.startsWith('## ')) {
      const text = line.replace('## ', '').trim();
      // 見出しをIDとして使用
      const id = generateSlug(text);

      currentH2 = {
        id,
        text,
        level: 2,
        items: [],
      };
      result.push(currentH2);
    }
    // ### から始まる行はh3要素
    else if (line.startsWith('### ')) {
      const text = line.replace('### ', '').trim();
      // 見出しをIDとして使用
      const id = generateSlug(text);

      const h3Item: TOCItem = {
        id,
        text,
        level: 3,
      };

      // 現在のH2配下に追加
      if (currentH2) {
        currentH2.items = currentH2.items || [];
        currentH2.items.push(h3Item);
      }
    }
  }

  return result;
}

/**
 * テキストからURLスラッグを生成
 * シンプルな方法で日本語を含む文字列をIDに変換
 */
function generateSlug(text: string): string {
  // 空文字列の場合はランダムなIDを返す（重複防止）
  if (!text.trim()) {
    return `toc-${Math.random().toString(36).substring(2, 9)}`;
  }

  // スペースをハイフンに置換し、IDとして使用できない文字を削除
  return text
    .toLowerCase()
    .replace(/\s+/g, '-') // スペースをハイフンに置換
    .replace(/[^a-z0-9\-\u3000-\u9fff\u30a0-\u30ff\uff00-\uff9f]/g, '') // 英数字、日本語、ハイフン以外を削除
    .trim();
}
