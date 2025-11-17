import { cn } from '@/lib/utils';

export type TOCItem = {
  id: string;
  text: string;
  level: number;
  items?: TOCItem[];
};

type TableOfContentsProps = {
  items: TOCItem[];
  className?: string;
};

/**
 * 記事の目次を表示するコンポーネント
 *
 * このコンポーネントはh2要素から目次を生成し、記事の上部に表示します。
 * 目次項目をクリックすると、通常のアンカータグを使用してNext.jsのルーターを介さずに該当セクションに直接ジャンプします。
 * 目次が空の場合は何も表示されません。
 *
 * @param items - 目次項目の配列。各項目にはid（見出しのID）、text（見出しテキスト）、level（見出しレベル）が含まれます
 * @param className - 追加のCSSクラス名（任意）。ボーダーやパディングなどのスタイルをカスタマイズする際に使用します
 * @returns 目次コンポーネント。項目が空の場合はnullを返します
 *
 * @example
 * ```tsx
 * import { TableOfContents } from '@/components/feature/content/table-of-contents';
 * import type { TOCItem } from '@/components/feature/content/table-of-contents';
 *
 * const tocItems: TOCItem[] = [
 *   {
 *     id: 'introduction',
 *     text: '概要',
 *     level: 2,
 *   },
 *   {
 *     id: 'installation',
 *     text: 'インストール',
 *     level: 2,
 *   },
 * ];
 *
 * export default function BlogPost() {
 *   return (
 *     <article>
 *       <TableOfContents items={tocItems} />
 *       <div id='introduction'>
 *         <h2>概要</h2>
 *         ...
 *       </div>
 *     </article>
 *   );
 * }
 * ```
 */
export function TableOfContents({ items, className }: TableOfContentsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn('mt-8 rounded-lg border p-4', className)}>
      <h2 className='mb-3 text-lg font-medium'>目次</h2>
      <nav>
        <ol className='list-inside space-y-2 text-sm'>
          {items.map((item, index) => (
            <TableOfContentsItem key={item.id} item={item} index={index + 1} />
          ))}
        </ol>
      </nav>
    </div>
  );
}

type TableOfContentsItemProps = {
  item: TOCItem;
  index: number;
};

/**
 * 目次の個別項目を表示する内部コンポーネント
 *
 * このコンポーネントは目次の1つの項目（見出し）を表示します。
 * 項目番号を表示し、クリックすると該当セクションにスクロールします。
 * H3項目がある場合は、1., 2.のような形式でネスト表示されます。
 *
 * @param item - 表示する目次項目。id、text、level、items?プロパティを含みます
 * @param index - 項目の番号（1から始まる）。目次のナンバリングに使用されます
 * @returns 目次項目コンポーネント
 *
 * @example
 * ```tsx
 * // TableOfContentsコンポーネント内で自動的に使用されます
 * const item = {
 *   id: 'introduction',
 *   text: '概要',
 *   level: 2,
 *   items: [
 *     { id: 'intro-1', text: 'サブ項目1', level: 3 },
 *     { id: 'intro-2', text: 'サブ項目2', level: 3 },
 *   ],
 * };
 *
 * <TableOfContentsItem item={item} index={1} />
 * // 出力:
 * // 1. 概要
 * //   1. サブ項目1
 * //   2. サブ項目2
 * ```
 */
function TableOfContentsItem({ item, index }: TableOfContentsItemProps) {
  return (
    <li>
      <div className='flex items-start'>
        <span className='mr-2 text-muted-foreground'>{index}.</span>
        <a href={`#${item.id}`} className='hover:text-primary hover:underline'>
          {item.text}
        </a>
      </div>
      {/* H3項目（子項目）がある場合はネスト表示 */}
      {item.items && item.items.length > 0 && (
        <ol className='ml-6 mt-1 list-inside space-y-1'>
          {item.items.map((subItem, subIndex) => (
            <li key={subItem.id}>
              <div className='flex items-start'>
                <span className='mr-2 text-muted-foreground'>
                  {subIndex + 1}.
                </span>
                <a
                  href={`#${subItem.id}`}
                  className='hover:text-primary hover:underline'
                >
                  {subItem.text}
                </a>
              </div>
            </li>
          ))}
        </ol>
      )}
    </li>
  );
}
