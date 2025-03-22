'use client';
import { useEffect, useState } from 'react';

/**
 * 目次の各アイテムを表すインターフェース
 */
interface TOCItem {
  id: string;
  text: string;
  level: number; // 見出しのレベル（h1, h2, h3など）
}

interface TableOfContentsProps {
  source: string; // MDX
}

/**
 * MDXコンテンツの見出しから目次を生成するコンポーネント
 * 実際のDOM要素からIDを取得して、正確なリンクを生成します
 */
export function TableOfContents({ source }: TableOfContentsProps) {
  const [toc, setToc] = useState<TOCItem[]>([]);

  // MDXソースから見出しを抽出し、実際のDOMからIDを取得する
  useEffect(() => {
    // 1. まずMDXソースから見出しのテキストを抽出
    const headingRegex = /^## (.*$)/gm; // ## で始まる行を見出しとして検出
    const matches = [...source.matchAll(headingRegex)];

    // 2. DOMのレンダリングを待つための短い遅延を設定
    // MDXコンテンツが完全にレンダリングされた後にIDを取得する
    const timer = setTimeout(() => {
      // 3. ドキュメント内のすべてのh2要素を取得
      const h2Elements = document.querySelectorAll('h2');

      if (h2Elements.length === 0) {
        return;
      }

      // 4. 実際のDOM要素から目次アイテムを作成
      const items: TOCItem[] = matches.map((match, index) => {
        const text = match[1].trim();
        // テキスト内容が一致する見出し要素を探し、そのIDを取得
        // 見つからない場合はフォールバックとしてインデックスベースのIDを使用
        const element = Array.from(h2Elements).find(
          (el) => el.textContent?.trim() === text,
        );
        const id = element?.id || `heading-${index}`;

        return {
          id,
          text,
          level: 3, // h2は目次内でレベル3として扱う
        };
      });

      setToc(items);
    }, 100);

    return () => clearTimeout(timer); // クリーンアップ関数
  }, [source]);

  if (toc.length === 0) {
    return null;
  }

  /**
   * 目次アイテムのクリック処理
   * クリックした見出しへスムーズにスクロールする
   */
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, itemId: string) {
    e.preventDefault();
    const element = document.getElementById(itemId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop,
        behavior: 'auto',
      });
      window.history.pushState({}, '', `#${itemId}`);
    }
  }

  return (
    <div className='pt-4 rounded-lg border-border/50 bg-card/50'>
      <h2 className='scroll-m-20 text-xl font-semibold tracking-tight'>目次</h2>
      <ul className='space-y-1.5'>
        {toc.map((item) => (
          <li key={item.id} className='line-clamp-2'>
            <a
              href={`#${item.id}`}
              className='inline-block py-1 transition-colors hover:text-foreground font-medium text-primary'
              onClick={(e) => handleClick(e, item.id)}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
