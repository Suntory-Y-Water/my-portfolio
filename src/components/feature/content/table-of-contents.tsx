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
 * h2とh3要素から階層構造を持った目次を生成します
 * 通常のアンカータグを使用してNext.jsのルーターを介さずに直接ジャンプします
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

function TableOfContentsItem({ item, index }: TableOfContentsItemProps) {
  return (
    <li>
      <div className='flex items-start'>
        <span className='mr-2 text-muted-foreground'>{index}.</span>
        <a href={`#${item.id}`} className='hover:text-primary hover:underline'>
          {item.text}
        </a>
      </div>
      {item.items && item.items.length > 0 && (
        <ol className='mt-2 list-inside space-y-1 pl-6 text-sm'>
          {item.items.map((child, childIndex) => (
            <li key={child.id} className='flex items-start'>
              <span className='mr-2 text-muted-foreground'>
                {index}.{childIndex + 1}.
              </span>
              <a
                href={`#${child.id}`}
                className='hover:text-primary hover:underline'
              >
                {child.text}
              </a>
            </li>
          ))}
        </ol>
      )}
    </li>
  );
}
