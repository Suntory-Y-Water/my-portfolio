import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

/**
 * ページヘッダーコンポーネントのProps型定義
 */
type PageHeaderProps = {
  /** ページの見出しテキスト */
  heading: string;
  /** 説明文(オプション) */
  text?: string;
  /** カスタムCSSクラス名(オプション) */
  className?: string;
};

/**
 * ページヘッダーコンポーネント
 *
 * ページのタイトルと説明文を表示し、下部にセパレーターを配置します。
 * ブログ一覧やタグページなどの各ページで使用されます。
 *
 * @param props - ページヘッダーのプロパティ
 * @returns ページヘッダー要素
 *
 * @example
 * ```tsx
 * <PageHeader
 *   heading="ブログ記事一覧"
 *   text="技術記事や開発メモを公開しています"
 * />
 * ```
 */
export function PageHeader({ heading, text, className }: PageHeaderProps) {
  return (
    <>
      <div className={cn('space-y-4', className)}>
        <h1 className='inline-block text-2xl'>{heading}</h1>
        {text && <p className='text-muted-foreground'>{text}</p>}
      </div>
      <Separator className='my-4' />
    </>
  );
}
